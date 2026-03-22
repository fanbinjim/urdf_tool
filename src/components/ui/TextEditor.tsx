import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onLoad: () => void;
  onFormat: () => void;
  onClear: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  content,
  onChange,
  onLoad,
  onFormat,
  onClear,
}) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    validateXML(content);
  }, [content]);

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
      const xmlDoc = parser.parseFromString(content, 'text/xml');
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
      
      onChange(formattedLines.join('\n'));
      onFormat();
    } catch (error) {
      console.error('Failed to format XML:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden relative">
        <button
          onClick={() => setIsFullScreen(true)}
          className="absolute top-2 right-2 z-10 p-1 bg-gray-800/80 text-white rounded hover:bg-gray-700/80 transition-colors"
          title="全屏编辑"
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
          onChange={onChange}
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
          onClick={onLoad}
          disabled={!isValid || !content.trim()}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Load URDF
        </button>
        <button
          onClick={formatXML}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Format
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className={`text-sm ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isValid ? '✓ XML format is valid' : `✗ ${errorMessage}`}
      </div>

      {isFullScreen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsFullScreen(false);
            }
          }}
        >
          <div className="w-full h-full max-w-6xl max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden relative">
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              title="关闭"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <CodeMirror
              value={content}
              height="100%"
              extensions={[xml()]}
              theme={oneDark}
              onChange={onChange}
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
        </div>
      )}
    </div>
  );
};
