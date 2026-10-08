import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check } from 'lucide-react';

export default function KeyInput({ onKeySet, savedKey, localLlm }) {
    const [key, setKey] = useState(savedKey || '');
    const [isVisible, setIsVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(!!savedKey);

    useEffect(() => {
        if (savedKey) setKey(savedKey);
    }, [savedKey]);

    const handleSave = () => {
        if (key.trim().length > 0) {
            onKeySet(key);
            setIsSaved(true);
        }
    };

    return (
        <div className="card p-4 sm:p-6 mb-8 animate-fade">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-paper3 rounded-input text-brass">
                    <Key size={18} />
                </div>
                <h2 className="font-display lowercase text-lg text-ink">Gemini API Key</h2>
            </div>
            {localLlm && (
                <div className="mb-4 p-3 bg-paper2 border border-rule rounded-input flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-ok animate-pulse shrink-0" />
                        <span className="text-ink font-medium">Custom LLM Active:</span>
                        <span className="text-brass font-mono">{localLlm.model}</span>
                        <span className="text-muted truncate max-w-[220px]">({localLlm.baseUrl})</span>
                    </div>
                    <span className="badge-ok text-[10px] shrink-0">CONNECTED</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative sm:flex-1">
                    <input
                        type={isVisible ? "text" : "password"}
                        value={key}
                        onChange={(e) => {
                            setKey(e.target.value);
                            setIsSaved(false);
                        }}
                        placeholder="AIzaSy..."
                        className="input-field pr-12 font-mono"
                    />
                    <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                    >
                        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!key || isSaved}
                    className={isSaved ? 'badge-ok px-4 cursor-default' : 'btn-primary'}
                >
                    {isSaved ? <><Check size={14} /> Ready</> : 'Set Key'}
                </button>
            </div>
            <p className="mt-3 text-xs text-muted leading-relaxed">
                {localLlm ? (
                    <span>
                        Moment picker and viral scoring are running on your custom endpoint (<code className="text-ink font-mono">{localLlm.model}</code>).
                        A Gemini API key is <strong className="text-ink">optional</strong>.
                    </span>
                ) : (
                    <>
                        Your key is stored locally in your browser for convenience.
                        <br />
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brass hover:underline mt-1 inline-block"
                        >
                            Get your free Gemini API Key here →
                        </a>
                    </>
                )}
            </p>
        </div>
    );
}
