import React, { useState, useRef, useEffect  } from "react";
import { Stack, TextField } from "@fluentui/react";
import { SendRegular } from "@fluentui/react-icons";
import Send from "../../assets/Send.svg";
import styles from "./QuestionInput.module.css";
import Microfone from '../../assets/Microfone.svg';
import StopIcon from '../../assets/stop.png';
import Speak from '../../assets/speak.png';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
// import franc from 'franc-min';

type webkitSpeechRecognition = any;

interface Props {
    onSend: (question: string, id?: string) => void;
    disabled: boolean;
    placeholder?: string;
    clearOnSend?: boolean;
    conversationId?: string;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend, conversationId }: Props) => {
    const [question, setQuestion] = useState<string>("");
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [language, setLanguage] = useState(""); // Defina o idioma desejado aqui
    
    
    const synth = useRef<SpeechSynthesis>();
    const recognizerRef = useRef<sdk.SpeechRecognizer>();

    useEffect(() => {
        // Inicializar o reconhecimento de fala quando o componente montar
        const speechConfig = sdk.SpeechConfig.fromSubscription("b297cc740e404532ae00da4ff5f7a8f6", "eastus");
        recognizerRef.current = new sdk.SpeechRecognizer(speechConfig);

        recognizerRef.current.recognizing = (s, e) => {
            console.log(`RECOGNIZING: Text=${e.result.text}`);
        };

        recognizerRef.current.recognized = (s, e) => {
            if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
                console.log(`RECOGNIZED: Text=${e.result.text}`);
            } else if (e.result.reason === sdk.ResultReason.NoMatch) {
                console.log("NOMATCH: Nenhuma correspondência encontrada");
            }
        };
        recognizerRef.current.startContinuousRecognitionAsync();

        // Inicializar a síntese de fala
        synth.current = window.speechSynthesis;


        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.stopContinuousRecognitionAsync();
            }
        };
    }, []);

    const addQuestionMarkIfNeeded = (text: string): string => {
        // Verificar se a frase termina com um caractere de interrogação
        if (!text.trim().endsWith('?')) {
            // Se não terminar, adicionar uma interrogação ao final da frase
            return text.trim() + '?';
        }
        return text.trim();
    };

    const startRecording = () => {
        setIsRecording(true);
    };

    const stopRecording = () => {
        setIsRecording(false);
        // Envie a pergunta e limpe o texto
        onSend(question);
        if (clearOnSend) {
            setQuestion("");
        }
    };


    const speakResponse = (text: string) => {
        if (synth.current && synth.current.speak) {
            const utterance = new SpeechSynthesisUtterance(text);
            synth.current.speak(utterance);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(event.target.value);
    };



    const sendQuestion = () => {
        console.log('send question');
        
        if (disabled || !question.trim()) {
            return;
        }

        if (conversationId) {
            onSend(question, conversationId);
        } else {
            onSend(question);
        }

        if (clearOnSend) {
            setQuestion("");
        }
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey && !(ev.nativeEvent?.isComposing === true)) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setQuestion(newValue || "");
    };

    const sendQuestionDisabled = disabled || !question.trim();

    // console.log({question});
    const speak = async () => {
        console.log('idioma selecionado', language);
        const speechConfig = sdk.SpeechConfig.fromSubscription("b297cc740e404532ae00da4ff5f7a8f6", "eastus");
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
        speechConfig.speechSynthesisLanguage = language; // Defina o idioma de síntese de fala
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        console.log('Variaveis', { language, question, speechConfig  }, speechConfig.speechSynthesisLanguage, language);
        await synthesizer.speakTextAsync(question);
    };

    const languageOptions = [
        // { code: 'es-ES', label: 'Espanhol (Espanha)' },
        { code: 'en-US', label: 'Inglês (Estados Unidos)' },
        { code: 'zh-CN', label: 'Chinês (simplificado)' },
        // { code: 'zh-tw', label: 'Chinês tradicional' },
        { code: 'pt-BR', label: 'Português (Brasil)' },
      ];
    
    
    return (
        <Stack horizontal className={styles.questionInputContainer}>
        <TextField
            className={styles.questionInputTextArea}
            placeholder={placeholder}
            multiline
            resizable={false}
            borderless
            value={question}
            onChange={onQuestionChange}
            onKeyDown={onEnterPress}
        />
        {/* Teste de linguagem         */}
    {/* <div className={styles.containerSpeak}>
      <select value={language} onChange={(e) => setLanguage(e.target.value)} 
                  className={styles.containerSelect}
                  >
        {languageOptions.map((option, index) => (
          <option key={index} value={option.code}>{option.label}</option>
        ))}
      </select>
      <button onClick={speak} className={styles.buttonContainer}>
        <img style={{ width: '40px', position: 'relative' }} src={Speak} className={styles.microphoneIcon} alt="Ícone speak" />
      </button>
    </div> */}
<div
    className={styles.questionAlinha}
    role="button"
    tabIndex={0}
    aria-label={isRecording ? "Stop recording" : "Start recording"}
    onClick={isRecording ? stopRecording : startRecording}
    onKeyDown={e => (e.key === "Enter" || e.key === " ") ? (isRecording ? stopRecording() : startRecording()) : null}
>
    {isRecording ? (
        <button style={{ background: 'none', border: 'none', padding: '0' }}>
            <img src={StopIcon} className={styles.questionInputSendButton} alt="Stop recording" />
        </button>
    ) : (
        <button style={{ background: 'none', border: 'none', padding: '0' }}>
            <img src={Microfone} className={styles.questionInputSendButton} alt="Start recording" />
        </button>
    )}



    <div
        className={styles.questionInputSendButtonContainer}
        role="button"
        tabIndex={0}
        aria-label="Ask question button"
        onClick={sendQuestion}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") ? sendQuestion() : null}
    >
        {sendQuestionDisabled ? 
            <SendRegular className={styles.questionInputSendButtonDisabled} />
            :
            <img src={Send} className={styles.questionInputSendButton} alt="Send question" />
        }
    </div>
</div>



        <div className={styles.questionInputBottomBorder} />
    </Stack>
    );
};
