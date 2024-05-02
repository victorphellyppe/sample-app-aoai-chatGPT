import React, { useState, useRef  } from "react";
import { Stack, TextField } from "@fluentui/react";
import { SendRegular } from "@fluentui/react-icons";
import Send from "../../assets/Send.svg";
import styles from "./QuestionInput.module.css";
import Microfone from '../../assets/Microfone.svg';
import StopIcon from '../../assets/stop.png';
import Speak from '../../assets/speak.png';
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
    const [language, setLanguage] = useState(""); // Defina o idioma desejado aqui


    // const startRecording = () => {
    //     console.log('startRecording, questionInput');
        
    //     const recognition = new (window as any).webkitSpeechRecognition();
    //     // recognition.current.lang = ['pt-BR', 'en-US', 'zh-CN']; // Lista de idiomas suportados
    //     // recognition.current.interimResults = false; // Se deseja resultados intermediários, mude para true
    
    //     recognition.current.onstart = () => {
    //         console.log('Speech recognition started');
    //     };
    
    //     recognition.current.onresult = (event: any) => {
    //         console.log({PropiedadeEvento: event});
            
    //         const result = event.results[0][0].transcript;
    //         console.log('Speech recognized: ', result);
    //         setQuestion(result);
    
    //         // Determine o idioma da transcrição
    //         const detectedLanguage = event.results[0].lang;
    
    //         // Mapeie os códigos de idioma detectados para idiomas legíveis
    //         let language;
    //         switch (detectedLanguage) {
    //             case 'pt-BR':
    //                 language = 'Português';
    //                 console.log(language);
                    
    //                 break;
    //             case 'en-US':
    //                 language = 'Inglês';
    //                 console.log(language);

    //                 break;
    //             case 'zh-CN':
    //                 language = 'Chinês';
    //                 console.log(language);

    //                 break;
    //             default:
    //                 language = 'Desconhecido';
    //                 console.log(language);

    //         }
    
    //         console.log('Detected language: ', language);
    
    //         // Aqui você pode adicionar a lógica para enviar a transcrição e o idioma para onde for necessário
    //         setTimeout(() => {
    //             const data = JSON.stringify({ question: result, language: detectedLanguage });
    //             console.log('setTimeout', data);
    //             onSend(data);
    //             stopRecording();
    //         }, 3000);
    //     };
    
    //     recognition.current.onerror = (event: any) => {
    //         console.error('Speech recognition error: ', event.error);
    //     };
    
    //     recognition.current.onend = () => {
    //         console.log('Speech recognition ended');
    //     };
    
    //     recognition.current.start();
    // };
    

    // Função para verificar se a transcrição é uma pergunta
const isQuestionIntent = (transcription: string): boolean => {
    // Lista de palavras interrogativas em português
    const interrogatives = ['quem', 'o que', 'quando', 'onde', 'por que', 'como'];

    // Verifica se a transcrição termina com alguma palavra interrogativa
    return interrogatives.some((interrogative) => transcription.trim().endsWith(interrogative));
};

const addInterrogation = (transcription: string): string => {
    // Adiciona uma interrogação ao final da transcrição, se não houver uma já presente
    return transcription.trim().endsWith('?') ? transcription : `${transcription.trim()}?`;
};


    const startRecording = () => {
        console.log('startRecording, questionImnput');
        
        recognition.current = new (window as any).webkitSpeechRecognition();
        // recognition.lang = ['pt-BR', 'en-US', 'zh-CN']; // Lista de idiomas suportados
        recognition.current.onresult = (event: any) => {
            const result = event.results[0][0].transcript;
            setQuestion(result);
            // Determine o idioma da transcrição
            const detectedLanguage = event.results[0].lang;
    console.log(detectedLanguage, 'detectedLanguage');
    
    //         // Mapeie os códigos de idioma detectados para idiomas legíveis
            let language;
            switch (detectedLanguage) {
                case 'pt-BR':
                    language = 'Português';
                    console.log('Pt', language);
                    
                    break;
                case 'en-US':
                    language = 'Inglês';
                    console.log('en',language);

                    break;
                case 'zh-CN':
                    language = 'Chinês';
                    console.log('chines', language);

                    break;
                default:
                    language = 'Desconhecido';
                    console.log('desconhecido', language);

            }
            setTimeout(() => {
                    const data = JSON.stringify({ question: result, language: detectedLanguage });
                    console.log('setTimeout', data);
                    onSend(data);
                    stopRecording();
                        }, 2000);
        };
        recognition.current.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (recognition.current) {
            recognition.current.stop();
            setIsRecording(false);
            sendQuestion();
        }
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
