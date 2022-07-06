/**
 * Annotations.tsx
 * @project dolbyio-demo
 * @author Samson Sham <samson.sham@dolby.com>
 */
import EncodingSettingsModel from "./EncodingSettingsModel";
import Konva from "konva";
import { onCleanup, onMount, createUniqueId } from "solid-js";
import { Stage } from "konva/lib/Stage";
import { Layer } from "konva/lib/Layer";
import styles from './App.module.css';

const IMG_WIDTH = 178;
const IMG_HEIGHT = 100;
const TXT_HEIGHT = 20;

// Translating Decimal time to HH:MM:SS.ss timestamp
function timeToTimestamp(timeSec: number): string {
    const hours = Math.floor(timeSec/3600);
    const minutes = Math.floor((timeSec%3600)/60);
    const seconds = timeSec%60;
    return `${("0"+hours).slice(-2)}:${("0"+minutes).slice(-2)}:${("0"+seconds).replace(/\d?(\d{2}(\.?\d{0,2}))\d*/, "$1")}`;
}

// Event bus for unidirectional one-off event, which does not leave the event in memory space
export const AnnotationsEventDispatcher = new EventTarget();

function Annotations() {
    const {graphTimeline, duration} = EncodingSettingsModel;
    let stage: Stage, layer: Layer;

    // Used for handling browser window resizing
    function responsiveHandler() {
        if (!stage) return;
        stage.width(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0));
        stage.height(Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0));
    }
    // Handling new image
    function newImageAdded(imgFile: File) {
        if (!stage) {
            // Lazy initialization for Konva's Stage
            stage = new Konva.Stage({
                container: "timeline",
                width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
                height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
            });
        }
        if (!layer) {
            // Lazy initialization for Konva's Layer
            layer = new Konva.Layer();
            stage.add(layer);
        }
        // Line of which the cursor is dragging, hide when it is not initialized (dragged)
        const timeIndicator = new Konva.Line({
            points: [0, 0, 0, stage.height()],
            stroke: 'cyan',
            strokeWidth: 1,
            visible: false,
        });

        const imgElement = new Image();
        imgElement.src = URL.createObjectURL(imgFile);
        const image = new Konva.Image({
            image: imgElement,
            width: IMG_WIDTH,
            height: IMG_HEIGHT,
        });
        // Time label of which cursor position (timeIndicator) correspond in time
        const timeText = new Konva.Text({
            fontFamily: 'Helvetica',
            width: IMG_WIDTH,
            height: TXT_HEIGHT,
            y: IMG_HEIGHT,
            align: 'right',
            fontSize: 18,
            text: "Please drag...",
        });
        const rect = new Konva.Rect({
            width: IMG_WIDTH,
            height: IMG_HEIGHT + TXT_HEIGHT,
            fill: 'lightgreen',
        });
        // Assign an unique ID to the annotation
        const id = createUniqueId();
        const imageGroup = new Konva.Group({
            x: (stage.width() - IMG_WIDTH) / 2,
            y: (stage.height() - IMG_HEIGHT) / 2,
            draggable: true,
            dragBoundFunc: pos => {
                const boundWidth = stage.width();
                const boundHeight = stage.height();
                const pointer = stage.getPointerPosition();
                if (!pointer) return pos;
                // Prevent timeIndicator goes beyond boarders
                const pointerX = Math.min(Math.max(pointer.x, 0), boundWidth);
                const pointerInTime = (pointerX / boundWidth) * duration();
                timeText.text(timeToTimestamp(pointerInTime));
                timeIndicator.x(pointerX);  // Set timeIndicator position

                // Initialize when first dragged, show timeIndicator
                if (!timeIndicator.visible()) {
                    timeIndicator.show();
                    // Initialize timeIndicator position in graphTimeline
                    graphTimeline.set(id, {imgSrc: imgFile.name, time: pointerInTime});
                } else {
                    // Update timeIndicator position
                    const node = graphTimeline.get(id);
                    node!.time = pointerInTime;
                }
                // Position the imageGroup boundary, based on top-left corner
                return {
                    x: pos.x < 0 ?
                        0 :
                        pos.x + IMG_WIDTH > boundWidth ?
                            boundWidth - IMG_WIDTH :
                            pos.x,
                    y: pos.y < 0 ?
                        0 :
                        pos.y + IMG_HEIGHT > boundHeight ?
                            boundHeight - IMG_HEIGHT :
                            pos.y,
                };
            },
        });
        imageGroup.on('mouseover', () => {document.body.style.cursor = 'pointer';})
        imageGroup.on('mouseout', () => {document.body.style.cursor = 'default';})
        imageGroup.add(rect);
        imageGroup.add(timeText);
        imageGroup.add(image);
        layer.add(timeIndicator);
        layer.add(imageGroup);
        return;
    }
    type CustomEventListener = EventListener & ((e: CustomEvent) => void);
    function customEventHandler(e: CustomEvent) {
        if (e.detail) return newImageAdded(e.detail);
    }
    onMount(() => {
        window.addEventListener('resize', responsiveHandler);
        AnnotationsEventDispatcher.addEventListener('image', customEventHandler as CustomEventListener);
    });
    onCleanup(() => {
        window.addEventListener('resize', responsiveHandler);
        AnnotationsEventDispatcher.removeEventListener('image', customEventHandler as CustomEventListener);
    });

    return (<>
        <div id="timeline" class={styles.timeline}></div>
    </>);
}

export default Annotations;