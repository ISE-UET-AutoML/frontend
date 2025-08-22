import React from 'react'
import { Button } from './ui/button'

export default function ShadcnDemo() {
	return (
		<div className="max-w-4xl mx-auto py-16 px-4">
			<h2 className="text-3xl font-bold text-center mb-8">
				shadcn/ui Components Demo
			</h2>
			
			{/* Button Variants */}
			<div className="space-y-8">
				<div className="text-center">
					<h3 className="text-xl font-semibold mb-4">Button Variants</h3>
					<div className="flex flex-wrap gap-4 justify-center">
						<Button>Default Button</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="destructive">Destructive</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="link">Link</Button>
					</div>
				</div>

				{/* Button Sizes */}
				<div className="text-center">
					<h3 className="text-xl font-semibold mb-4">Button Sizes</h3>
					<div className="flex flex-wrap gap-4 justify-center items-center">
						<Button size="sm">Small</Button>
						<Button size="default">Default</Button>
						<Button size="lg">Large</Button>
						<Button size="icon">🚀</Button>
					</div>
				</div>

				{/* ML Platform Specific Buttons */}
				<div className="text-center">
					<h3 className="text-xl font-semibold mb-4">ML Platform Actions</h3>
					<div className="flex flex-wrap gap-4 justify-center">
						<Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
							Start Training
						</Button>
						<Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
							Deploy Model
						</Button>
						<Button variant="destructive">
							Stop Training
						</Button>
						<Button variant="secondary">
							View Results
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
