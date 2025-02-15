import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { stackoverflowDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const MarkdownRenderer = ({ markdownText }) => {
  return (
    <div className = "markdown">
      <ReactMarkdown
        components={{
          code({ className, children, ...rest }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                PreTag="div"
                language={match[1]}
                style={stackoverflowDark}
                {...rest}
              >
                {children}
              </SyntaxHighlighter>
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {markdownText}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
