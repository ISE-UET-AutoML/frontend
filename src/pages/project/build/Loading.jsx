import React, { useState, useEffect } from 'react'
import {
	artificialIntelligence,
	Aipoweredmarketingtoolsabstract,
	LiveChatbot,
	SandyLoading,
	ChatGif1,
	LiquidLoading,
} from 'src/assets/gif'

export default function Loading({ currentStep }) {
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
			className="flex flex-col items-center justify-center py-12 gap-4"
			style={{ marginTop: '50px' }}
		>
			<div className="relative w-full h-[400px] overflow-hidden">
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
					fontSize: '18px',
					marginTop: '20px',
				}}
			>
				It may take a while, you can exit and come back later.
			</p>
		</div>
	)
}
