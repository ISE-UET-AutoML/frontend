import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

const MarkdownRenderer = ({ markdownText }) => {
	useEffect(() => {
		import('katex/dist/katex.min.css')
	}, [])
	return (
		<>
			<style>{`
				/* Ensure markdown text follows theme colors with white fallback */
				.markdown.theming,
				.markdown.theming * {
					color: var(--text, #ffffff) !important;
				}
				.markdown.theming a {
					color: var(--accent-text, #93c5fd) !important;
					text-decoration: underline;
				}
				.markdown.theming code {
					background: var(--code-bg, rgba(255,255,255,0.08));
					padding: 2px 6px;
					border-radius: 4px;
				}
			`}</style>
			<div className="markdown theming">
				<ReactMarkdown
					remarkPlugins={[remarkMath, remarkGfm]}
					rehypePlugins={[rehypeKatex]}
				>
					{markdownText}
				</ReactMarkdown>
			</div>
		</>
	)
}

export default MarkdownRenderer
