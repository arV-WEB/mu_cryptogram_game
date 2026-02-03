from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import random
import os

app = Flask(__name__)
app.secret_key = 'mu_crypto_game_secret_key_2024'

# Data pemain lengkap dengan nama file gambar yang benar
players_data = {
  "2020": [
    {
      "id": 1,
      "name": "David de Gea",
      "position": "GK",
      "number": 1,
      "year": 2020,
      "image": "david_degea.jpg",
      "encryption": "GKDG1",
      "difficulty": "easy",
      "nationality": "Spain"
    },
    {
      "id": 2,
      "name": "Harry Maguire",
      "position": "CB",
      "number": 5,
      "year": 2020,
      "image": "goat_maguire.jpg",
      "encryption": "CBHM5",
      "difficulty": "easy",
      "nationality": "England"
    },
    {
      "id": 3,
      "name": "Bruno Fernandes",
      "position": "CM",
      "number": 18,
      "year": 2020,
      "image": "bruno_fernandes.jpg",
      "encryption": "CMBF8",
      "difficulty": "easy",
      "nationality": "Portugal"
    },
    {
      "id": 4,
      "name": "Marcus Rashford",
      "position": "LW",
      "number": 10,
      "year": 2020,
      "image": "Marcus_Rashford.jpg",
      "encryption": "LWMR0",
      "difficulty": "medium",
      "nationality": "England"
    },
    {
      "id": 5,
      "name": "Paul Pogba",
      "position": "CM",
      "number": 6,
      "year": 2020,
      "image": "pogba.jpg",
      "encryption": "CMPP6",
      "difficulty": "medium",
      "nationality": "France"
    },
    {
      "id": 6,
      "name": "Anthony Martial",
      "position": "CF",
      "number": 9,
      "year": 2020,
      "image": "Anthony_Martial.jpg",
      "encryption": "CFAM9",
      "difficulty": "medium",
      "nationality": "France"
    },
    {
      "id": 7,
      "name": "Donny van de Beek",
      "position": "CM",
      "number": 34,
      "year": 2020,
      "image": "donny_van_de_beek.jpg",
      "encryption": "CMDB4",
      "difficulty": "hard",
      "nationality": "Netherlands"
    },
    {
      "id": 8,
      "name": "Alex Telles",
      "position": "LB",
      "number": 27,
      "year": 2020,
      "image": "Alex_telles.jpg",
      "encryption": "LBAT7",
      "difficulty": "hard",
      "nationality": "Brazil"
    },
    {
      "id": 9,
      "name": "Edinson Cavani",
      "position": "CF",
      "number": 7,
      "year": 2020,
      "image": "Edinson_Cavani.jpg",
      "encryption": "CFEC7",
      "difficulty": "hard",
      "nationality": "Uruguay"
    },
    {
      "id": 10,
      "name": "Phil Jones",
      "position": "CB",
      "number": 4,
      "year": 2020,
      "image": "PhilJones.jpg",
      "encryption": "CBPJ4",
      "difficulty": "hard",
      "nationality": "England"
    }
  ],
  "2021": [
    {
      "id": 1,
      "name": "Cristiano Ronaldo",
      "position": "CF",
      "number": 7,
      "year": 2021,
      "image": "ronaldo.jpg",
      "encryption": "CFCR7",
      "difficulty": "easy",
      "nationality": "Portugal"
    },
    {
      "id": 2,
      "name": "Raphaël Varane",
      "position": "CB",
      "number": 19,
      "year": 2021,
      "image": "varane.jpg",
      "encryption": "CBRV9",
      "difficulty": "easy",
      "nationality": "France"
    },
    {
      "id": 3,
      "name": "Jadon Sancho",
      "position": "RW",
      "number": 25,
      "year": 2021,
      "image": "sancho.jpg",
      "encryption": "RWJS5",
      "difficulty": "medium",
      "nationality": "England"
    },
    {
      "id": 4,
      "name": "Dean Henderson",
      "position": "GK",
      "number": 26,
      "year": 2021,
      "image": "dean_henderson.jpg",
      "encryption": "GKDH6",
      "difficulty": "medium",
      "nationality": "England"
    },
    {
      "id": 5,
      "name": "Victor Lindelöf",
      "position": "CB",
      "number": 2,
      "year": 2021,
      "image": "Lindelof.jpg",
      "encryption": "CBVL2",
      "difficulty": "medium",
      "nationality": "Sweden"
    },
    {
      "id": 6,
      "name": "Aaron Wan-Bissaka",
      "position": "RB",
      "number": 29,
      "year": 2021,
      "image": "Aaron_Wan_Bissaka.jpg",
      "encryption": "RBAW9",
      "difficulty": "hard",
      "nationality": "England"
    },
    {
      "id": 7,
      "name": "Fred",
      "position": "CM",
      "number": 17,
      "year": 2021,
      "image": "Fred.jpg",
      "encryption": "CMFR7",
      "difficulty": "hard",
      "nationality": "Brazil"
    },
    {
      "id": 8,
      "name": "Scott McTominay",
      "position": "CM",
      "number": 39,
      "year": 2021,
      "image": "McTominay.jpg",
      "encryption": "CMSM9",
      "difficulty": "hard",
      "nationality": "Scotland"
    }
  ],
  "2022": [
    {
      "id": 1,
      "name": "Lisandro Martínez",
      "position": "CB",
      "number": 6,
      "year": 2022,
      "image": "Lisandro_Martinez.jpg",
      "encryption": "CBLM6",
      "difficulty": "easy",
      "nationality": "Argentina"
    },
    {
      "id": 2,
      "name": "Casemiro",
      "position": "DM",
      "number": 18,
      "year": 2022,
      "image": "casemiro.jpg",
      "encryption": "DMCS8",
      "difficulty": "easy",
      "nationality": "Brazil"
    },
    {
      "id": 3,
      "name": "Antony",
      "position": "RW",
      "number": 21,
      "year": 2022,
      "image": "antony.jpg",
      "encryption": "RWAN1",
      "difficulty": "medium",
      "nationality": "Brazil"
    },
    {
      "id": 4,
      "name": "Tyrell Malacia",
      "position": "LB",
      "number": 12,
      "year": 2022,
      "image": "Tyrell_Malacia.jpg",
      "encryption": "LBTM2",
      "difficulty": "medium",
      "nationality": "Netherlands"
    },
    {
      "id": 5,
      "name": "Christian Eriksen",
      "position": "CM",
      "number": 14,
      "year": 2022,
      "image": "Eriksen.jpg",
      "encryption": "CMCE4",
      "difficulty": "medium",
      "nationality": "Denmark"
    },
    {
      "id": 6,
      "name": "Alejandro Garnacho",
      "position": "LW",
      "number": 49,
      "year": 2022,
      "image": "Garnacho.jpg",
      "encryption": "LWAG9",
      "difficulty": "hard",
      "nationality": "Argentina"
    },
    {
      "id": 7,
      "name": "Tom Heaton",
      "position": "GK",
      "number": 22,
      "year": 2022,
      "image": "Heaton.jpg",
      "encryption": "GKTH2",
      "difficulty": "hard",
      "nationality": "England"
    },
    {
      "id": 8,
      "name": "Anthony Elanga",
      "position": "LW",
      "number": 36,
      "year": 2022,
      "image": "elanga.jpg",
      "encryption": "LWAE6",
      "difficulty": "hard",
      "nationality": "Sweden"
    }
  ]
}

# Fungsi untuk memeriksa apakah gambar ada
def check_image_exists(filename):
    image_path = os.path.join(app.static_folder, 'IMAGE', filename)
    return os.path.exists(image_path)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tutorial')
def tutorial():
    return render_template('tutorial.html')

@app.route('/setting', methods=['GET', 'POST'])
def setting():
    if request.method == 'POST':
        session['game_year'] = request.form.get('year', '2020')
        session['game_difficulty'] = request.form.get('difficulty', 'easy')
        # Reset semua state game
        session['game_state'] = {
            'lives': 5,
            'score': 0,
            'level': 1,
            'correctAnswers': 0,
            'totalNeeded': 10,
            'gameYear': request.form.get('year', '2020'),
            'gameDifficulty': request.form.get('difficulty', 'easy'),
            'current_player': None,
            'used_players': [],
            'game_over': False
        }
        return redirect(url_for('play'))
    return render_template('setting.html')

@app.route('/play')
def play():
    if 'game_year' not in session:
        return redirect(url_for('setting'))
    return render_template('play.html')

@app.route('/api/get_question')
def get_question():
    # Inisialisasi game state jika belum ada
    if 'game_state' not in session:
        session['game_state'] = {
            'lives': 5,
            'score': 0,
            'level': 1,
            'correctAnswers': 0,
            'totalNeeded': 10,
            'gameYear': '2020',
            'gameDifficulty': 'easy',
            'current_player': None,
            'used_players': [],
            'game_over': False
        }
    
    game_state = session['game_state']
    
    # Cek apakah game over
    if game_state.get('game_over', False) or game_state['lives'] <= 0:
        return jsonify({
            'error': 'Game over! Silakan restart game.',
            'game_over': True
        })
    
    # Ambil tahun dan difficulty dari state
    year = str(game_state['gameYear'])  # Pastikan string
    difficulty = game_state['gameDifficulty']
    
    # Filter pemain berdasarkan tahun
    available_players = players_data.get(year, [])
    
    if not available_players:
        return jsonify({'error': 'Tidak ada pemain untuk tahun ini'})
    
    # Filter berdasarkan difficulty jika ada
    filtered_players = []
    if difficulty:
        filtered_players = [p for p in available_players if p['difficulty'] == difficulty]
    
    # Jika tidak ada pemain dengan difficulty tersebut, gunakan semua
    if not filtered_players:
        filtered_players = available_players
    
    # Filter out pemain yang sudah ditampilkan
    used_ids = game_state.get('used_players', [])
    available_filtered = [p for p in filtered_players if p['id'] not in used_ids]
    
    # Jika semua sudah ditampilkan, reset used_players
    if not available_filtered:
        game_state['used_players'] = []
        available_filtered = filtered_players
    
    # Pilih pemain secara acak
    selected_player = random.choice(available_filtered)
    
    # Simpan player saat ini di session untuk pengecekan jawaban
    game_state['current_player'] = selected_player
    game_state['used_players'].append(selected_player['id'])
    
    # PERBAIKAN: Berikan FULL URL untuk gambar
    # Atau berikan path yang benar relatif terhadap server
    image_url = f"/static/IMAGE/{selected_player['image']}"
    
    # Cek apakah gambar ada
    if not check_image_exists(selected_player['image']):
        print(f"Warning: Gambar {selected_player['image']} tidak ditemukan")
        # Anda bisa menambahkan fallback image path di sini
    
    # Update session
    session['game_state'] = game_state
    session.modified = True
    
    # Return data yang dibutuhkan frontend
    return jsonify({
        'image': selected_player['image'],  # Hanya nama file
        'image_url': image_url,  # Full URL untuk memudahkan frontend
        'player_name': selected_player['name'],
        'player_position': selected_player['position'],
        'player_nationality': selected_player['nationality'],
        'encryption': selected_player['encryption'],
        'lives': game_state['lives'],
        'score': game_state['score'],
        'level': game_state['level'],
        'correctAnswers': game_state['correctAnswers'],
        'totalNeeded': game_state['totalNeeded'],
        'year': year,
        'difficulty': difficulty,
        'game_over': game_state['game_over']
    })

@app.route('/api/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    user_answer = data.get('answer', '').strip().upper()
    
    game_state = session.get('game_state', {})
    
    # Cek apakah game over
    if game_state.get('game_over', False) or game_state.get('lives', 0) <= 0:
        return jsonify({
            'error': 'Game sudah selesai. Silakan restart.',
            'game_over': True
        }), 400
    
    current_player = game_state.get('current_player')
    
    if not current_player:
        return jsonify({'error': 'Tidak ada pemain aktif'}), 400
    
    # Cek jawaban
    correct = user_answer == current_player['encryption']
    
    response_data = {
        'correct': correct,
        'correct_answer': current_player['encryption'],
        'player_name': current_player['name']
    }
    
    if correct:
        # Tambah skor
        game_state['score'] += 10
        game_state['correctAnswers'] += 1
        
        # Cek level up
        if game_state['correctAnswers'] >= game_state['totalNeeded']:
            game_state['level'] += 1
            game_state['correctAnswers'] = 0
            game_state['totalNeeded'] += 5
            
            # Tingkatkan difficulty setiap 3 level
            if game_state['level'] % 3 == 0:
                difficulties = ['easy', 'medium', 'hard']
                current_idx = difficulties.index(game_state.get('gameDifficulty', 'easy'))
                if current_idx < len(difficulties) - 1:
                    game_state['gameDifficulty'] = difficulties[current_idx + 1]
            
            # Ganti tahun setiap 6 level
            if game_state['level'] % 6 == 0:
                years = ['2020', '2021', '2022']
                current_idx = years.index(game_state.get('gameYear', '2020'))
                if current_idx < len(years) - 1:
                    game_state['gameYear'] = years[current_idx + 1]
            
            response_data['level_up'] = True
        else:
            response_data['level_up'] = False
    else:
        # Jawaban salah: kurangi nyawa
        game_state['lives'] -= 1
        
        # Pastikan nyawa tidak minus
        if game_state['lives'] < 0:
            game_state['lives'] = 0
        
        # Cek apakah game over
        if game_state['lives'] <= 0:
            game_state['game_over'] = True
            response_data['game_over'] = True
        else:
            response_data['game_over'] = False
    
    # Update session
    session['game_state'] = game_state
    session.modified = True
    
    # Tambahkan data state ke response
    response_data.update({
        'lives': game_state['lives'],
        'score': game_state['score'],
        'level': game_state['level'],
        'correctAnswers': game_state['correctAnswers'],
        'totalNeeded': game_state['totalNeeded'],
        'game_over': game_state.get('game_over', False)
    })
    
    return jsonify(response_data)

@app.route('/api/game_state')
def get_game_state():
    if 'game_state' not in session:
        session['game_state'] = {
            'lives': 5,
            'score': 0,
            'level': 1,
            'correctAnswers': 0,
            'totalNeeded': 10,
            'gameYear': '2020',
            'gameDifficulty': 'easy',
            'current_player': None,
            'used_players': [],
            'game_over': False
        }
        session.modified = True
    
    game_state = session['game_state']
    
    # Pastikan nilai tidak ada yang None
    for key in ['lives', 'score', 'level', 'correctAnswers', 'totalNeeded']:
        if game_state.get(key) is None:
            game_state[key] = 0
    
    return jsonify(game_state)

@app.route('/api/reset_game', methods=['POST'])
def reset_game():
    # Ambil tahun dan difficulty dari session atau gunakan default
    game_year = session.get('game_year', '2020')
    game_difficulty = session.get('game_difficulty', 'easy')
    
    # Reset semua data ke awal
    session['game_state'] = {
        'lives': 5,
        'score': 0,
        'level': 1,
        'correctAnswers': 0,
        'totalNeeded': 10,
        'gameYear': game_year,
        'gameDifficulty': game_difficulty,
        'current_player': None,
        'used_players': [],
        'game_over': False
    }
    session.modified = True
    
    return jsonify({
        'status': 'reset', 
        'game_state': session['game_state'],
        'reset': True
    })

@app.route('/answer_table')
def answer_table():
    # Siapkan data untuk tabel jawaban
    all_players = []
    for year, players in players_data.items():
        for player in players:
            all_players.append({
                'year': year,
                'name': player['name'],
                'position': player['position'],
                'number': player['number'],
                'encryption': player['encryption'],
                'difficulty': player['difficulty'],
                'nationality': player['nationality']
            })
    
    # Urutkan berdasarkan tahun dan nama
    all_players.sort(key=lambda x: (x['year'], x['name']))
    
    return render_template('answer_table.html', players=all_players)

if __name__ == '__main__':
    # Buat folder IMAGE jika belum ada
    os.makedirs(os.path.join('static', 'IMAGE'), exist_ok=True)
    print("MU Crypto Game running at http://localhost:5000")
    print("Tabel jawaban: http://localhost:5000/answer_table")
    app.run(debug=True, port=5000)