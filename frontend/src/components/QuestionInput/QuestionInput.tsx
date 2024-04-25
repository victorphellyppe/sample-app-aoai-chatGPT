import React, { useState, useRef  } from "react";
import { Stack, TextField } from "@fluentui/react";
import { SendRegular } from "@fluentui/react-icons";
import Send from "../../assets/Send.svg";
import styles from "./QuestionInput.module.css";
import Microfone from '../../assets/Microfone.svg';
import StopIcon from '../../assets/stop.png';


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
        <div
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
        </div>
        <div className={styles.questionInputBottomBorder} />
    </Stack>

    );
};
