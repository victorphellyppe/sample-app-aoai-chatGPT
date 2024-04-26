import React, { useState, useRef  } from "react";
import { Stack, TextField } from "@fluentui/react";
import { SendRegular } from "@fluentui/react-icons";
import Send from "../../assets/Send.svg";
import styles from "./QuestionInput.module.css";
import Microfone from '../../assets/Microfone.svg';
import StopIcon from '../../assets/stop.png';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

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
    const recognition = useRef<webkitSpeechRecognition | null>(null);
    const [language, setLanguage] = useState('en-US'); // Defina o idioma desejado aqui


    const startRecording = () => {
        recognition.current = new (window as any).webkitSpeechRecognition();
        recognition.current.lang = 'pt-BR';
        recognition.current.onresult = (event: any) => {
            const result = event.results[0][0].transcript;
            setQuestion(result);
        };
        recognition.current.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (recognition.current) {
            recognition.current.stop();
            setIsRecording(false);
        }
    };

    const sendQuestion = () => {
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

    // text to speech
    console.log({question});
    const speak = async () => {
        const speechConfig = sdk.SpeechConfig.fromSubscription("b297cc740e404532ae00da4ff5f7a8f6", "eastus");
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    
        await synthesizer.speakTextAsync(question);
    };

    const languageOptions = [
        { code: 'es-ES', label: 'Espanhol (Espanha)' },
        { code: 'en-US', label: 'Inglês (Estados Unidos)' },
        { code: 'fr-FR', label: 'Francês (França)' },
        { code: 'pt-BR', label: 'Português (Brasil)' },
        // Adicione mais idiomas conforme necessário
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
    <div className="container-speak">
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        {languageOptions.map((option, index) => (
          <option key={index} value={option.code}>{option.label}</option>
        ))}
      </select>
      <button onClick={speak}>Speak</button>
    </div>
        {/* <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        {languageOptions.map((option, index) => (
          <option key={index} value={option.code}>{option.label}</option>
        ))}
      </select>
        <button onClick={speak}>Speak</button> */}

        {/* <div
        style={{border: '1px solid green'}}
            role="button"
            tabIndex={0}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            onClick={isRecording ? stopRecording : startRecording}
            onKeyDown={e => (e.key === "Enter" || e.key === " ") ? (isRecording ? stopRecording : startRecording) : null}
        >
            {isRecording ? (
                <button style={{ background: 'none', border: 'none', padding: '0' }}>
                    <img src={StopIcon} className={styles.questionInputSendButton} />
                </button>
            ) : (
                <button style={{ background: 'none', border: 'none', padding: '0' }}>
                    <img src={Microfone} className={styles.questionInputSendButton} />
                </button>
            )}

<div className={styles.questionInputSendButtonContainer} 
                role="button" 
                tabIndex={0}
                aria-label="Ask question button"
                onClick={sendQuestion}
                onKeyDown={e => e.key === "Enter" || e.key === " " ? sendQuestion() : null}
            >
                { sendQuestionDisabled ? 
                    <SendRegular className={styles.questionInputSendButtonDisabled}/>
                    :
                    <img src={Send} className={styles.questionInputSendButton}/>
                }
            </div>
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
