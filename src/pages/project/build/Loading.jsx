import React, { useState, useEffect } from 'react'
import {
	artificialIntelligence,
	Aipoweredmarketingtoolsabstract,
	LiveChatbot,
	SandyLoading,
	ChatGif1,
	LiquidLoading,
} from 'src/assets/gif'
import { Button } from 'antd'
import { PATHS } from 'src/constants/paths'
import { HomeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
export default function Loading({ currentStep }) {
	const navigate = useNavigate()
	const iframes = [
		'https://lottie.host/embed/1d947a49-e3c3-4829-b6a3-4aad8b315a3e/2be5iOiE2i.lottie',
		'https://lottie.host/embed/45dede61-c804-4fba-9143-ad8ac39c0cb2/Ma1FXatlzi.lottie',
		'https://lottie.host/embed/f6ec3dec-0fca-412a-8538-cea8aeca6c5c/gPWIC8O3wf.lottie',
		'https://lottie.host/embed/90580e0a-59d4-4f53-a45a-ae0c1e4432ba/XLLYQHCHKn.lottie',
		'https://lottie.host/embed/946d751f-399f-4c74-ab0f-66b56d35baac/zy4jCJuhwQ.lottie',
	]

	const [index, setIndex] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prev) => (prev + 1) % iframes.length)
		}, 10000)

		return () => clearInterval(interval)
	}, [iframes.length])
	return (
		<div
			className="flex flex-col items-center justify-center py-8 gap-6 overflow-hidden"
			style={{ marginTop: '-20px' }}
		>
			<div className="relative w-full max-w-2xl h-[350px] overflow-hidden">
				{iframes.map((src, i) => (
					<iframe
						key={i}
						src={src}
						className={`absolute top-0 left-0 w-full h-full border-0 transition-opacity duration-1000 ${
							i === index ? 'opacity-100' : 'opacity-0'
						}`}
					></iframe>
				))}
			</div>

			<p
				style={{
					color: 'var(--text)',
					fontSize: '20px',
					fontWeight: '500',
					marginTop: '5px',
					textAlign: 'center',
					lineHeight: '1.6',
				}}
			>
				It may take a while, you can exit and come back later.
			</p>
			<Button
				type="primary"
				icon={<HomeOutlined style={{ fontSize: '18px' }} />}
				size="large"
				className="mt-2 transition-all duration-300 hover:scale-105"
				style={{
					background: 'linear-gradient(135deg, #3b82f6, #22d3ee)',
					border: 'none',
					borderRadius: '12px',
					padding: '14px 40px',
					height: 'auto',
					fontSize: '17px',
					fontWeight: '600',
					boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
				}}
				onClick={() => navigate(PATHS.PROJECTS)}
			>
				Back to Home
			</Button>
		</div>
	)
}
