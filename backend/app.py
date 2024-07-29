from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator
from gtts import gTTS
import base64
import io

app = Flask(__name__)
CORS(app)

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text')
    src_lang = data.get('src_lang')
    dest_lang = data.get('dest_lang')

    if not text or not src_lang or not dest_lang:
        return jsonify({'error': 'Invalid input'}), 400
    
    try:
        translated_text = GoogleTranslator(source=src_lang, target=dest_lang).translate(text)
        return jsonify({'translated_text': translated_text}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text')
    language_code = data.get('language_code')

    if not text or not language_code:
        return jsonify({'error': 'Missing text or language code'}), 400
    
    try:
        tts = gTTS(text=text, lang=language_code)
        audio_io = io.BytesIO()
        tts.write_to_fp(audio_io)
        audio_io.seek(0)
        audio_content = base64.b64encode(audio_io.read()).decode('utf-8')
        return jsonify({'audio_content': audio_content}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
