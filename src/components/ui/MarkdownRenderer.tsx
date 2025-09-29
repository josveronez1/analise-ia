import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-foreground mt-6 mb-3" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-foreground mt-5 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-foreground mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="text-foreground mb-2 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside text-foreground mb-2 pl-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-foreground mb-2 pl-4" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-foreground" {...props} />,
          a: ({ node, ...props }) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-border pl-4 py-2 italic text-muted-foreground" {...props} />,
          code: ({ children, ...props }: any) => {
            const isInline = !props.className?.includes('language-');
            return isInline ? (
              <code className="bg-muted text-destructive px-1 py-0.5 rounded" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-muted p-3 rounded-md overflow-x-auto text-sm">
                <code className="text-destructive" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ node, ...props }) => <table className="min-w-full divide-y divide-border my-4" {...props} />,
          thead: ({ node, ...props }) => <thead className="bg-muted" {...props} />,
          th: ({ node, ...props }) => <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="bg-card divide-y divide-border" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-muted/50" {...props} />,
          td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
