const ImageConfig = (labels) => {
    const labelinConfig = `
        <View>
        <Image name="image" value="$image"/>
        <Choices name="choice" toName="image" showInLine="true">
        ${(labels.map((label, index) => {
        return '<Choice value="' + label + '"/>'
    })).join('    \n')
        }
        </Choices>
        </View>
    `
    return labelinConfig
}

export { ImageConfig }