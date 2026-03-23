import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';
import { useLanguage } from '../../context/LanguageContext';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onLoad: (content?: string) => void;
  onFormat: () => void;
  onClear: () => void;
  onExport: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  content,
  onChange,
  onLoad,
  onFormat,
  onClear,
  onExport,
}) => {
  const { t } = useLanguage();
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [originalContent, setOriginalContent] = useState(content);
  const [currentContent, setCurrentContent] = useState(content);

  useEffect(() => {
    validateXML(currentContent);
    setHasChanges(currentContent !== originalContent);
  }, [currentContent, originalContent]);

  useEffect(() => {
    setOriginalContent(content);
    setCurrentContent(content);
  }, [content]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isValid && currentContent.trim()) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isValid, currentContent]);

  const validateXML = (xmlString: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const errorNode = doc.querySelector('parsererror');
      
      if (errorNode) {
        setIsValid(false);
        setErrorMessage('Invalid XML format');
      } else {
        setIsValid(true);
        setErrorMessage('');
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage('Invalid XML format');
    }
  };

  const formatXML = () => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(currentContent, 'text/xml');
      const serializer = new XMLSerializer();
      let formatted = serializer.serializeToString(xmlDoc);
      
      formatted = formatted.replace(/></g, '>\n<');
      
      const lines = formatted.split('\n');
      let indent = 0;
      const formattedLines = lines.map(line => {
        line = line.trim();
        if (line.startsWith('</')) {
          indent = Math.max(0, indent - 1);
        }
        const indentedLine = '  '.repeat(indent) + line;
        if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
          indent++;
        }
        return indentedLine;
      });
      
      setCurrentContent(formattedLines.join('\n'));
      onChange(formattedLines.join('\n'));
      onFormat();
    } catch (error) {
      console.error('Failed to format XML:', error);
    }
  };

  const handleSave = () => {
    if (isValid && currentContent.trim()) {
      onChange(currentContent);
      onLoad(currentContent);
      setOriginalContent(currentContent);
      setHasChanges(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }
  };

  const handleUndo = () => {
    setCurrentContent(originalContent);
    onChange(originalContent);
    setHasChanges(false);
  };

  const handleOpenFullScreen = () => {
    setOriginalContent(content);
    setCurrentContent(content);
    setHasChanges(false);
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    if (hasChanges) {
      if (confirm('您有未保存的修改，确定要关闭吗？')) {
        setIsFullScreen(false);
      }
    } else {
      setIsFullScreen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden relative">
        <button
          onClick={handleOpenFullScreen}
          className="absolute top-2 right-2 z-10 p-1 bg-gray-800/80 text-white rounded hover:bg-gray-700/80 transition-colors"
          title={t.textEditor.fullScreen}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
          </svg>
        </button>
        
        <CodeMirror
          value={content}
          height="300px"
          extensions={[xml()]}
          theme={oneDark}
          readOnly={true}
          className="text-left"
          style={{ textAlign: 'left', textIndent: 0 }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={formatXML}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
        >
          {t.textEditor.format}
        </button>
        <button
          onClick={onExport}
          disabled={!isValid || !content.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-center"
        >
          {t.textEditor.export}
        </button>
        <button
          onClick={onClear}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-center"
        >
          {t.textEditor.clear}
        </button>
      </div>

      <div className={`text-sm ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isValid ? t.textEditor.xmlValid : `✗ ${errorMessage}`}
      </div>

      {isFullScreen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseFullScreen();
            }
          }}
        >
          <div className="w-full h-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden relative flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-white text-lg font-semibold">{t.textEditor.title}</h2>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <>
                    <button
                      onClick={handleUndo}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
                      title={t.textEditor.undo}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      {t.textEditor.undo}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!isValid || !currentContent.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      title={t.textEditor.save + ' (Ctrl+S)'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      {t.textEditor.save}
                    </button>
                  </>
                )}
                <button
                  onClick={handleCloseFullScreen}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  title={t.textEditor.close}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {showSaveSuccess && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-20 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t.textEditor.saveSuccess}</span>
              </div>
            )}
            
            <div className="flex-1 overflow-hidden">
              <CodeMirror
                value={currentContent}
                height="calc(90vh - 80px)"
                extensions={[xml()]}
                theme={oneDark}
                onChange={(value) => setCurrentContent(value)}
                className="text-left h-full"
                style={{ textAlign: 'left', textIndent: 0, height: '100%' }}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  searchKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
