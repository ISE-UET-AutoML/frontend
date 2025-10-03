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
		<div className="markdown">
			<ReactMarkdown
				remarkPlugins={[remarkMath, remarkGfm]}
				rehypePlugins={[rehypeKatex]}
			>
				{markdownText}
			</ReactMarkdown>
		</div>
	)
}

export default MarkdownRenderer
