class MUEncryptor:
    def __init__(self):
        # Mapping posisi ke kode
        self.position_codes = {
            'GK': 'GK',  # Goalkeeper
            'CB': 'CB',  # Center Back
            'LB': 'LB',  # Left Back
            'RB': 'RB',  # Right Back
            'DM': 'DM',  # Defensive Midfielder
            'CM': 'CM',  # Center Midfielder
            'LW': 'LW',  # Left Winger
            'RW': 'RW',  # Right Winger
            'CF': 'CF'   # Center Forward
        }
    
    def encrypt_player(self, player_data):
        """
        Encrypt player data to code format
        Format: POSITION + INITIALS + LAST_DIGIT_OF_NUMBER
        Example: CMJL0 (CM + JL + 0 dari 10)
        """
        try:
            # Ambil kode posisi
            position_code = self.position_codes.get(player_data['position'], 'XX')
            
            # Ambil inisial (dua huruf pertama dari nama belakang)
            name_parts = player_data['name'].split()
            if len(name_parts) > 1:
                initials = name_parts[-1][:2].upper()
            else:
                initials = player_data['name'][:2].upper()
            
            # Ambil digit terakhir dari nomor
            last_digit = str(player_data['number'])[-1]
            
            # Gabungkan menjadi kode enkripsi
            encrypted = f"{position_code}{initials}{last_digit}"
            return encrypted
            
        except Exception as e:
            print(f"Encryption error: {e}")
            return "XXXX0"
    
    def decrypt_to_name(self, encrypted_code, players_list):
        """
        Decrypt code to player name
        """
        for player in players_list:
            if self.encrypt_player(player) == encrypted_code:
                return player['name']
        return "Unknown Player"
    
    def validate_code(self, code):
        """
        Validate if code follows encryption format
        """
        if len(code) != 5:
            return False
        
        # Format: XXYYZ (X=position, Y=initials, Z=digit)
        position_part = code[:2]
        digit_part = code[-1]
        
        # Cek jika posisi valid
        if position_part not in self.position_codes.values():
            return False
        
        # Cek jika digit adalah angka
        if not digit_part.isdigit():
            return False
        
        return True