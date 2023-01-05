use humphrey::handlers::{serve_dir, serve_file};
use humphrey::http::{Request, Response, StatusCode};
use humphrey::App;

use humphrey_json::prelude::*;
use humphrey_json::Value;
use jasondb::Database;

use uuid::Uuid;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::UNIX_EPOCH;

static ASSETS_DIR: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../game/assets");
static DIST_DIR: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../game/dist");
static INDEX_FILE: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../game/index.html");
static STYLE_FILE: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../game/style.css");

struct State {
    db: Mutex<Database<LeaderboardEntry>>,
    ratelimiter: Mutex<HashMap<String, u64>>,
}

#[derive(FromJson, IntoJson)]
struct LeaderboardEntry {
    score: u32,
    key: String,
    ip: String,
}

#[derive(FromJson, IntoJson)]
struct LeaderboardAddRequest {
    name: String,
    score: u32,
    key: Option<String>,
}

fn main() {
    println!("[info] starting server...");

    let mut db: Database<LeaderboardEntry> = Database::new("leaderboard.jdb")
        .unwrap()
        .with_index("key")
        .unwrap();

    println!(
        "[info] loaded `leaderboard.jdb`, {} records",
        db.iter_unordered().count()
    );

    let app: App<State> = App::new_with_config(
        32,
        State {
            db: Mutex::new(db),
            ratelimiter: Mutex::new(HashMap::new()),
        },
    )
    .with_path_aware_route("/assets/*", serve_dir(ASSETS_DIR))
    .with_path_aware_route("/dist/*", serve_dir(DIST_DIR))
    .with_route("/style.css", serve_file(STYLE_FILE))
    .with_route("/", serve_file(INDEX_FILE))
    .with_route("/api/v1/leaderboard", leaderboard)
    .with_route("/api/v1/add", add_entry);

    println!("[info] server started on port 80");

    app.run("0.0.0.0:80").unwrap();
}

fn leaderboard(request: Request, state: Arc<State>) -> Response {
    let mut db = state.db.lock().unwrap();
    let mut leaderboard = db.iter().flatten().collect::<Vec<_>>();
    leaderboard.sort_by(|(_, a), (_, b)| b.score.cmp(&a.score));

    let json = Value::Array(
        leaderboard
            .iter()
            .map(|(name, entry)| {
                json!({
                    "name": name,
                    "score": entry.score
                })
            })
            .collect::<Vec<_>>(),
    )
    .serialize();

    println!("[req]  {} /api/v1/leaderboard", request.address);

    Response::new(StatusCode::OK, json).with_header("Content-Type", "application/json")
}

fn add_entry(request: Request, state: Arc<State>) -> Response {
    let mut ratelimiter = state.ratelimiter.lock().unwrap();
    let now = UNIX_EPOCH.elapsed().unwrap().as_secs();
    if let Some(last_request) = ratelimiter.get(&request.address.to_string()) {
        if now - last_request < 5 {
            println!("[req]  {} /api/v1/add (ratelimited)", request.address);

            return Response::new(
                StatusCode::Forbidden,
                json!({ "success": false, "error": "I knew this would happen" }).serialize(),
            );
        }
    }

    ratelimiter.insert(request.address.to_string(), now);

    let parsed_request: Option<LeaderboardAddRequest> = request
        .content
        .and_then(|v| String::from_utf8(v).ok())
        .and_then(|s| humphrey_json::from_str(s).ok());

    if let Some(parsed_request) = parsed_request {
        let mut db = state.db.lock().unwrap();

        if let Ok(existing_entry) = db.get(&parsed_request.name) {
            if parsed_request.key == Some(existing_entry.key.clone()) {
                db.set(
                    &parsed_request.name,
                    LeaderboardEntry {
                        score: parsed_request.score,
                        key: existing_entry.key.clone(),
                        ip: request.address.to_string(),
                    },
                )
                .unwrap();

                println!(
                    "[req]  {} /api/v1/add (`{}` updated with key)",
                    request.address, parsed_request.name
                );

                Response::new(
                    StatusCode::OK,
                    json!({ "success": true, "key": existing_entry.key }).serialize(),
                )
            } else {
                println!(
                    "[req]  {} /api/v1/add (`{}` forbidden)",
                    request.address, parsed_request.name
                );

                Response::new(
                    StatusCode::Forbidden,
                    json!({ "success": false, "error": "Name already exists and it is not you" })
                        .serialize(),
                )
            }
        } else {
            let key = Uuid::new_v4().to_string();

            db.set(
                &parsed_request.name,
                LeaderboardEntry {
                    score: parsed_request.score,
                    key: key.clone(),
                    ip: request.address.to_string(),
                },
            )
            .unwrap();

            println!(
                "[req]  {} /api/v1/add (`{}` added)",
                request.address, parsed_request.name
            );

            Response::new(
                StatusCode::OK,
                json!({ "success": true, "key": key }).serialize(),
            )
        }
    } else {
        println!("[req]  {} /api/v1/add (invalid request)", request.address);

        Response::new(
            StatusCode::BadRequest,
            json!({
                "success": false,
                "error": "Invalid request (my bad)"
            })
            .serialize(),
        )
    }
}
