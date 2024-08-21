const ImageConfig = (labels) => {
	const labelConfig = `
        <View>
        <Image name="image" value="$image"/>
        <Choices name="choice" toName="image" showInLine="true">
        ${labels
			.map((label, index) => {
				return '<Choice value="' + label + '"/>'
			})
			.join('    \n')}
        </Choices>
        </View>
    `
	return labelConfig
}
const TextConfig = (labels) => {
	const labelConfig = `
        <View>
        <Text name="text" value="$text"/>
        <Choices name="choice" toName="text" showInLine="true">
        ${labels
			.map((label, index) => {
				return '<Choice value="' + label + '"/>'
			})
			.join('    \n')}
        </Choices>
        </View>
    `
	return labelConfig
}

export { ImageConfig, TextConfig }
