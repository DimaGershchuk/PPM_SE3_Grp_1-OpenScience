/**
 * Text Stimulus.
 *
 * @author Alain Pitiot
 * @version 2020.5
 * @copyright (c) 2020 Ilixa Ltd. ({@link http://ilixa.com})
 * @license Distributed under the terms of the MIT License
 */


import {VisualStim} from './VisualStim';
import {Color} from '../util/Color';
import {ColorMixin} from '../util/ColorMixin';
import * as util from '../util/Util';


/**
 * @name module:visual.TextStim
 * @class
 * @extends VisualStim
 * @mixes ColorMixin
 * @param {Object} options
 * @param {String} options.name - the name used when logging messages from this stimulus
 * @param {Window} options.win - the associated Window
 * @param {string} [options.text="Hello World"] - the text to be rendered
 * @param {string} [options.font= "Arial"] - the font family
 * @param {Array.<number>} [options.pos= [0, 0]] - the position of the center of the text
 * @param {Color} [options.color= Color('white')] the background color
 * @param {number} [options.opacity= 1.0] - the opacity
 * @param {number} [options.depth= 0] - the depth (i.e. the z order)
 * @param {number} [options.contrast= 1.0] - the contrast
 * @param {string} [options.units= "norm"] - the units of the text size and position
 * @param {number} options.ori - the orientation (in degrees)
 * @param {number} [options.height= 0.1] - the height of the text
 * @param {boolean} [options.bold= false] - whether or not the text is bold
 * @param {boolean} [options.italic= false] - whether or not the text is italic
 * @param {string} [options.alignHoriz = 'left'] - horizontal alignment
 * @param {string} [options.alignVert = 'center'] - vertical alignment
 * @param {boolean} options.wrapWidth - whether or not to wrap the text horizontally
 * @param {boolean} [options.flipHoriz= false] - whether or not to flip the text horizontally
 * @param {boolean} [foptions.lipVert= false] - whether or not to flip the text vertically
 * @param {PIXI.Graphics} options.clipMask - the clip mask
 * @param {boolean} [options.autoDraw= false] - whether or not the stimulus should be automatically drawn on every frame flip
 * @param {boolean} [options.autoLog= false] - whether or not to log
 *
 * @todo vertical alignment, and orientation are currently NOT implemented
 */
export class TextStim extends util.mix(VisualStim).with(ColorMixin)
{
	constructor({
								name,
								win,
								text = 'Hello World',
								font = 'Arial',
								pos,
								color = new Color('white'),
								opacity,
								depth = 0,
								contrast = 1.0,
								units,
								ori,
								height = 0.1,
								bold = false,
								italic = false,
								alignHoriz = 'center',
								alignVert = 'center',
								wrapWidth,
								flipHoriz = false,
								flipVert = false,
								clipMask,
								autoDraw,
								autoLog
							} = {})
	{
		super({name, win, units, ori, opacity, depth, pos, clipMask, autoDraw, autoLog});

		this._addAttributes(TextStim, text, font, color, contrast, height, bold, italic, alignHoriz, alignVert, wrapWidth, flipHoriz, flipVert);

		// estimate the bounding box (using TextMetrics):
		this._estimateBoundingBox();

		if (this._autoLog)
		{
			this._psychoJS.experimentLogger.exp(`Created ${this.name} = ${this.toString()}`);
		}
	}



	/**
	 * Setter for the text attribute.
	 *
	 * @name module:visual.TextStim#setText
	 * @public
	 * @param {string} text - the text
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setText(text, log)
	{
		const hasChanged = this._setAttribute('text', text, log);

		if (hasChanged)
		{
			this._needUpdate = true;
			this._needPixiUpdate = true;
			this._textMetrics = undefined;

			// immediately estimate the bounding box:
			this._estimateBoundingBox();
		}
	}



	/**
	 * Setter for the alignHoriz attribute.
	 *
	 * @name module:visual.TextStim#setAlignHoriz
	 * @public
	 * @param {string} alignHoriz - the text horizontal alignment, e.g. 'center'
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setAlignHoriz(alignHoriz, log)
	{
		const hasChanged = this._setAttribute('alignHoriz', alignHoriz, log);

		if (hasChanged)
		{
			this._needUpdate = true;
			this._textMetrics = undefined;
			this._needPixiUpdate = true;

			// immediately estimate the bounding box:
			this._estimateBoundingBox();
		}
	}



	/**
	 * Setter for the wrapWidth attribute.
	 *
	 * @name module:visual.TextStim#setWrapWidth
	 * @public
	 * @param {boolean} wrapWidth - whether or not to wrap the text at the given width
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setWrapWidth(wrapWidth, log)
	{
		if (typeof wrapWidth === 'undefined')
		{
			if (!TextStim._defaultWrapWidthMap.has(this._units))
			{
				throw {
					origin: 'TextStim.setWrapWidth',
					context: 'when setting the wrap width of TextStim: ' + this._name,
					error: 'no default wrap width for unit: ' + this._units
				};
			}

			wrapWidth = TextStim._defaultWrapWidthMap.get(this._units);
		}

		const hasChanged = this._setAttribute('wrapWidth', wrapWidth, log);

		if (hasChanged)
		{
			this._needUpdate = true;
			this._needPixiUpdate = true;
			this._textMetrics = undefined;

			// immediately estimate the bounding box:
			this._estimateBoundingBox();
		}
	}



	/**
	 * Setter for the height attribute.
	 *
	 * @name module:visual.TextStim#setHeight
	 * @public
	 * @param {number} height - text height
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setHeight(height, log)
	{
		if (typeof height === 'undefined')
		{
			if (!TextStim._defaultLetterHeightMap.has(this._units))
			{
				throw {
					origin: 'TextStim.setHeight',
					context: 'when setting the height of TextStim: ' + this._name,
					error: 'no default letter height for unit: ' + this._units
				};
			}

			height = TextStim._defaultLetterHeightMap.get(this._units);
		}

		const hasChanged = this._setAttribute('height', height, log);

		if (hasChanged)
		{
			this._needUpdate = true;
			this._needPixiUpdate = true;
			this._textMetrics = undefined;

			// immediately estimate the bounding box:
			this._estimateBoundingBox();
		}
	}



	/**
	 * Setter for the italic attribute.
	 *
	 * @name module:visual.TextStim#setItalic
	 * @public
	 * @param {boolean} italic - whether or not the text is italic
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setItalic(italic, log)
	{
		const hasChanged = this._setAttribute('italic', italic, log);

		if (hasChanged)
		{
			this._needUpdate = true;
			this._textMetrics = undefined;
			this._needPixiUpdate = true;

			// immediately estimate the bounding box:
			this._estimateBoundingBox();
		}
	}



	/**
	 * Setter for the bold attribute.
	 *
	 * @name module:visual.TextStim#setBold
	 * @public
	 * @param {boolean} bold - whether or not the text is bold
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setBold(bold, log)
	{
		const hasChanged = this._setAttribute('bold', bold, log);

		if (hasChanged)
		{
			this._needUpdate = true;
			this._textMetrics = undefined;
			this._needPixiUpdate = true;

			// immediately estimate the bounding box:
			this._estimateBoundingBox();
		}
	}



	/**
	 * Setter for the flipVert attribute.
	 *
	 * @name module:visual.TextStim#setFlipVert
	 * @public
	 * @param {boolean} flipVert - whether or not to flip vertically
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setFlipVert(flipVert, log)
	{
		const hasChanged = this._setAttribute('flipVert', flipVert, log);

		if (hasChanged)
		{
			this._needUpdate = true;
			this._textMetrics = undefined;
			this._needPixiUpdate = true;

			// immediately estimate the bounding box:
			this._estimateBoundingBox();
		}
	}



	/**
	 * Setter for the flipHoriz attribute.
	 *
	 * @name module:visual.TextStim#setFlipHoriz
	 * @public
	 * @param {boolean} flipHoriz - whether or not to flip horizontally
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setFlipHoriz(flipHoriz, log)
	{
		const hasChanged = this._setAttribute('flipHoriz', flipHoriz, log);

		if (hasChanged)
		{
			this._needUpdate = true;
			this._textMetrics = undefined;
			this._needPixiUpdate = true;

			// immediately estimate the bounding box:
			this._estimateBoundingBox();
		}
	}



	/**
	 * Get the metrics estimated for the text and style.
	 *
	 * Note: getTextMetrics does not require the PIXI representation of the stimulus to be instantiated,
	 * unlike getSize().
	 *
	 * @name module:visual.TextStim#getTextMetrics
	 * @public
	 */
	getTextMetrics()
	{
		if (typeof this._textMetrics === 'undefined')
		{
			this._textMetrics = PIXI.TextMetrics.measureText(this._text, this._getTextStyle());
		}

		return this._textMetrics;
	}



	/**
	 * Estimate the bounding box.
	 *
	 * @name module:visual.TextStim#_estimateBoundingBox
	 * @function
	 * @override
	 * @protected
	 */
	_estimateBoundingBox()
	{
		// size of the text, irrespective of the orientation:
		const textMetrics = this.getTextMetrics();
		const textSize =  util.to_unit(
			[textMetrics.width, textMetrics.height],
			'pix',
			this._win,
			this._units
		);

		// take the alignment into account:
		const anchor = this._getAnchor();
		this._boundingBox = new PIXI.Rectangle(
			this._pos[0] - anchor[0] * textSize[0],
			this._pos[1] - anchor[1] * textSize[1],
			textSize[0],
			textSize[1]
		);

		// TODO take the orientation into account
	}



	/**
	 * Get the PIXI Text Style applied to the PIXI.Text
	 *
	 * @name module:visual.TextStim#_getTextStyle
	 * @private
	 */
	_getTextStyle()
	{
		return new PIXI.TextStyle({
			fontFamily: this._font,
			fontSize: Math.round(this._getLengthPix(this._height)),
			fontWeight: (this._bold) ? 'bold' : 'normal',
			fontStyle: (this._italic) ? 'italic' : 'normal',
			fill: this.getContrastedColor(this._color, this._contrast).hex,
			align: this._alignHoriz,
			wordWrap: (typeof this._wrapWidth !== 'undefined'),
			wordWrapWidth: (typeof this._wrapWidth !== 'undefined') ? this._getHorLengthPix(this._wrapWidth) : 0
		});
	}



	/**
	 * Update the stimulus, if necessary.
	 *
	 * @name module:visual.TextStim#_updateIfNeeded
	 * @function
	 * @private
	 */
	_updateIfNeeded()
	{
		if (!this._needUpdate)
		{
			return;
		}
		this._needUpdate = false;

		// update the PIXI representation, if need be:
		if (this._needPixiUpdate)
		{
			this._needPixiUpdate = false;

			if (typeof this._pixi !== 'undefined')
			{
				this._pixi.destroy(true);
			}
			this._pixi = new PIXI.Text(this._text, this._getTextStyle());
		}

		const anchor = this._getAnchor();
		[this._pixi.anchor.x, this._pixi.anchor.y] = anchor;

		this._pixi.scale.x = this._flipHoriz ? -1 : 1;
		this._pixi.scale.y = this._flipVert ? 1 : -1;

		this._pixi.rotation = this._ori * Math.PI / 180;
		this._pixi.position = util.to_pixiPoint(this.pos, this.units, this.win);

		this._pixi.alpha = this._opacity;
		this._pixi.zIndex = this._depth;

		// apply the clip mask:
		this._pixi.mask = this._clipMask;

		// update the size attributes:
		this._size = [
			this._getLengthUnits(Math.abs(this._pixi.width)),
			this._getLengthUnits(Math.abs(this._pixi.height))
		];

		// refine the estimate of the bounding box:
		this._boundingBox = new PIXI.Rectangle(
			this._pos[0] - anchor[0] * this._size[0],
			this._pos[1] - anchor[1] * this._size[1],
			this._size[0],
			this._size[1]
		);
	}


	
	/**
	 * Convert the alignment attributes into an anchor.
	 *
	 * @name module:visual.TextStim#_getAnchor
	 * @function
	 * @private
	 * @return {number[]} - the anchor
	 */
	_getAnchor()
	{
		let anchor = [];

		switch (this._alignHoriz)
		{
			case 'left':
				anchor.push(0);
				break;
			case 'right':
				anchor.push(1);
				break;
			default:
			case 'center':
				anchor.push(0.5);
		}
		switch (this._alignVert)
		{
			case 'top':
				anchor.push(0);
				break;
			case 'bottom':
				anchor.push(1);
				break;
			default:
			case 'center':
				anchor.push(0.5);
		}

		return anchor;
	}

}



/**
 * <p>This map associates units to default letter height.</p>
 *
 * @name module:visual.TextStim#_defaultLetterHeightMap
 * @readonly
 * @private
 */
TextStim._defaultLetterHeightMap = new Map([
	['cm', 1.0],
	['deg', 1.0],
	['degs', 1.0],
	['degFlatPos', 1.0],
	['degFlat', 1.0],
	['norm', 0.1],
	['height', 0.2],
	['pix', 20],
	['pixels', 20]
]);


/**
 * <p>This map associates units to default wrap width.</p>
 *
 * @name module:visual.TextStim#_defaultLetterHeightMap
 * @readonly
 * @private
 */
TextStim._defaultWrapWidthMap = new Map([
	['cm', 15.0],
	['deg', 15.0],
	['degs', 15.0],
	['degFlatPos', 15.0],
	['degFlat', 15.0],
	['norm', 1],
	['height', 1],
	['pix', 500],
	['pixels', 500]
]);
