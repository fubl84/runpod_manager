import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { useAppStore } from '../stores/app-store';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  id: string;
  onClose?: () => void;
}

export function Terminal({ id, onClose }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const initializedRef = useRef(false);
  const { settings } = useAppStore();

  useEffect(() => {
    if (!terminalRef.current || initializedRef.current) return;

    initializedRef.current = true;

    // Determine theme colors based on app theme
    const isDarkMode = settings.theme === 'dark';
    const terminalTheme = isDarkMode
      ? {
          // Dark mode terminal
          background: '#1E1E1E',
          foreground: '#D4D4D4',
          cursor: '#D4D4D4',
          cursorAccent: '#1E1E1E',
          selectionBackground: 'rgba(255, 255, 255, 0.2)',
          black: '#000000',
          red: '#CD3131',
          green: '#0DBC79',
          yellow: '#E5E510',
          blue: '#2472C8',
          magenta: '#BC3FBC',
          cyan: '#11A8CD',
          white: '#E5E5E5',
          brightBlack: '#666666',
          brightRed: '#F14C4C',
          brightGreen: '#23D18B',
          brightYellow: '#F5F543',
          brightBlue: '#3B8EEA',
          brightMagenta: '#D670D6',
          brightCyan: '#29B8DB',
          brightWhite: '#E5E5E5',
        }
      : {
          // Light mode terminal
          background: '#FFFFFF',
          foreground: '#000000',
          cursor: '#000000',
          cursorAccent: '#FFFFFF',
          selectionBackground: 'rgba(0, 0, 0, 0.15)',
          black: '#000000',
          red: '#CD3131',
          green: '#00BC00',
          yellow: '#949800',
          blue: '#0451A5',
          magenta: '#BC05BC',
          cyan: '#0598BC',
          white: '#555555',
          brightBlack: '#666666',
          brightRed: '#CD3131',
          brightGreen: '#14CE14',
          brightYellow: '#B5BA00',
          brightBlue: '#0451A5',
          brightMagenta: '#BC05BC',
          brightCyan: '#0598BC',
          brightWhite: '#A5A5A5',
        };

    // Create terminal instance with settings
    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: settings.terminalFontSize,
      fontFamily: settings.terminalFont,
      theme: terminalTheme,
      allowProposedApi: true,
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);

    // Open terminal in DOM
    xterm.open(terminalRef.current);
    fitAddon.fit();

    // Store refs
    xtermRef.current = xterm;
    fitAddonRef.current = fitAddon;

    // Create terminal in main process
    window.electronAPI.createTerminal(id);

    // Handle terminal output from main process
    const cleanup = window.electronAPI.onTerminalData(id, (data: string) => {
      xterm.write(data);
    });

    // Handle user input
    xterm.onData((data: string) => {
      window.electronAPI.writeToTerminal(id, data);
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
      window.electronAPI.resizeTerminal(id, xterm.cols, xterm.rows);
    };

    window.addEventListener('resize', handleResize);

    // Initial resize
    setTimeout(() => {
      handleResize();
    }, 100);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanup();
      window.electronAPI.killTerminal(id).catch(() => {
        // Ignore errors on cleanup
      });
      xterm.dispose();
      initializedRef.current = false;
    };
  }, [id, settings.terminalFont, settings.terminalFontSize, settings.theme]);

  // Update terminal settings when they change
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.fontSize = settings.terminalFontSize;
      xtermRef.current.options.fontFamily = settings.terminalFont;
      fitAddonRef.current?.fit();
    }
  }, [settings.terminalFont, settings.terminalFontSize]);

  const bgColor = settings.theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-white';

  return (
    <div className={`h-full w-full flex flex-col ${bgColor}`}>
      <div ref={terminalRef} className="flex-1 p-2" />
    </div>
  );
}