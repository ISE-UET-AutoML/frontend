import React, { useState, useEffect } from 'react'
import {
	artificialIntelligence,
	Aipoweredmarketingtoolsabstract,
	LiveChatbot,
	SandyLoading,
	ChatGif1,
	LiquidLoading,
} from 'src/assets/gif'

const gifs = [LiquidLoading, LiquidLoading, ChatGif1]

export default function Loading({ currentStep }) {
	return (
		<div
			className="flex flex-col items-center justify-center py-12 gap-4"
			style={{ marginTop: '50px' }}
		>
			<img
				src={gifs[currentStep]}
				alt="loading"
				style={{ width: '700px', height: '500px' }}
			/>
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
