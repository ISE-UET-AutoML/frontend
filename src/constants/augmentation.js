export const augmentations = [
	{
		name: 'Brightness',
		code: 'adjust_brightness',
		params: { delta: 0.1 }, // range: (-1, 1)
	},
	{
		name: 'Contrast',
		code: 'adjust_contrast',
		params: { contrast_factor: 1.5 }, // range: -inf, inf
	},
	{
		name: 'Hue',
		code: 'adjust_hue',
		params: { delta: 0.5 }, // range: [-1, 1]
	},
	{
		name: 'Saturation',
		code: 'adjust_saturation',
		params: { saturation_factor: 1.5 }, // range: [0, inf)
	},
	{
		name: 'Flip',
		code: 'flip_up_down',
		params: {},
	},
	{
		name: 'Flip',
		code: 'flip_left_right',
		params: {},
	},
	{
		name: 'Grayscale',
		code: 'rgb_to_grayscale',
		params: {},
	},
	{
		name: '90° Rotate',
		code: 'rot90',
		params: { k: 1 }, // k: number of rotation
	},
];
