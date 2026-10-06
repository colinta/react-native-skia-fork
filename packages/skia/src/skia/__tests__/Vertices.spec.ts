import { processResult } from "../../__tests__/setup";
import type { SkColor, SkPoint } from "../types";
import { BlendMode, VertexMode } from "../types";

import { setupSkia } from "./setup";

describe("Vertices", () => {
  it("Billinear gradient", () => {
    const { surface, canvas, width, Skia } = setupSkia();
    const vertices = [
      Skia.Point(0, 0),
      Skia.Point(width, 0),
      Skia.Point(width, width),
      Skia.Point(0, width),
    ];
    const colors = ["#61DAFB", "#fb61da", "#dafb61", "#61fbcf"].map((c) =>
      Skia.Color(c)
    );
    const triangle1 = [0, 1, 2];
    const triangle2 = [0, 2, 3];
    const indices = [...triangle1, ...triangle2];
    const vertexMode = VertexMode.Triangles;
    const vert = Skia.MakeVertices(
      vertexMode,
      vertices,
      undefined,
      colors,
      indices
    );
    expect(vert.uniqueID()).toBe(vert.uniqueID());
    const bounds = vert.bounds();
    expect(bounds.x).toBe(0);
    expect(bounds.y).toBe(0);
    expect(bounds.width).toBe(width);
    expect(bounds.height).toBe(width);
    const paint = Skia.Paint();
    paint.setColor(Skia.Color("purple"));
    canvas.drawVertices(vert, BlendMode.DstOver, paint);
    processResult(surface, "snapshots/vertices/billinear-gradient.png");
  });
  it("keeps per-vertex colors in order on a large mesh", () => {
    const { surface, canvas, width, Skia } = setupSkia();
    // 33,333 triangles: the first and the last cover the canvas, the ones in
    // between are degenerate. Joining the colors used to copy the whole buffer
    // once per vertex, which took several seconds at this size.
    const count = 99999;
    const red = Skia.Color("red");
    const green = Skia.Color("green");
    const blue = Skia.Color("blue");
    const positions: SkPoint[] = [];
    const colors: SkColor[] = [];
    positions.push(
      Skia.Point(0, 0),
      Skia.Point(width, 0),
      Skia.Point(0, width)
    );
    colors.push(red, red, red);
    for (let i = 6; i < count; i++) {
      positions.push(Skia.Point(0, 0));
      colors.push(green);
    }
    positions.push(
      Skia.Point(width, 0),
      Skia.Point(width, width),
      Skia.Point(0, width)
    );
    colors.push(blue, blue, blue);
    const start = performance.now();
    const vertices = Skia.MakeVertices(
      VertexMode.Triangles,
      positions,
      undefined,
      colors
    );
    expect(performance.now() - start).toBeLessThan(5000);
    const paint = Skia.Paint();
    canvas.drawVertices(vertices, BlendMode.Dst, paint);
    surface.flush();
    const image = surface.makeImageSnapshot();
    const pixel = (x: number, y: number) =>
      Array.from(
        image.readPixels(x, y, {
          width: 1,
          height: 1,
          colorType: image.getImageInfo().colorType,
          alphaType: image.getImageInfo().alphaType,
        }) as Uint8Array
      );
    expect(pixel(20, 20)).toEqual([255, 0, 0, 255]);
    expect(pixel(width - 20, width - 20)).toEqual([0, 0, 255, 255]);
  });
});
