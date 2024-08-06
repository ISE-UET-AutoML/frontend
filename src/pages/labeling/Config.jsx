const ImageConfig = (labels) => {
    const labelinConfig = `
    <View>
    <Image name="image" value="$image"/>
    <Choices name="choice" toName="image" showInLine="true">
        <Choice value="Boeing" background="blue"/>
        <Choice value="Airbus" background="green" />
    </Choices>
    </View>
    `
    return labelinConfig
}

export { ImageConfig }