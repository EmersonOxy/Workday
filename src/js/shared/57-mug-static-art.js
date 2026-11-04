/* Caneca oficial Workday — sprite aprovado pelo criador, 40×40 pixels logicos.
   PNG com transparência binária, paleta reduzida e sem sombra/vapor embutidos.
   Data URI permite usar o mesmo asset no GitHub Pages e no HTML offline. */
const MUG_STATIC_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAGy0lEQVR42u2YbWxbVxnHf9dxbcdZMufFi2lshyZLgqVN09IoH5o1jaINtowlgPaiig9MsH3pKgZCK0N8GWhFECRexKgmJoG0CK3bVNEAK4wNVsoStCgUVjpliRen6bUbJ3ET58XXsev48OHaN765jmN34QvikSyfe+/znPs///O83QP/l/9xkYpVbLylQZQ6+ex6SPqvAvQ5GwVAh8/FT38xCMBmmY2yzQ3DGMBssWnj3/5unJPPD2rXE4uz0p4A9DkbRX21nd7DnXzt28e0+x98EGQ6EMbtqkKJxXU29opyHI4K7bqppUH3/CcnT/GXv40BcH5qQrppgD2tPtF7uJMnn36c+bll/jH2b4OBtarOcK+mch/2ivK8L2jzubFaTJgtNl7/9R8ZGjpdEkhzLrgnnjpO+8Emzg1f2DMnn5wIakAf+eL96gJ//oIoFqQ5GwAnnv06+xvq+Ps7Y3kVz791ruBELS2f0sYdXV0GRicngjgcFfQ/1MGbZ6pgqgQGTUB33xHOvvq2EdTCpMHI46w23POPTOaMh+G2NgCOPv4V7BXlKLE4Sixu8M/itljaYjt0JYDf/6EBmMdZja21G4CNqQsFQcuLy5r9K4Mn4LY2eu7ro7m1qWQXMWUH8bUo7QebDOA8zmpaugY0YPnA5QKTF5eNDxYmOf/WOdp8bpKJjZtgEEjFFW6/6y6OPXOCUz8c1IHcDioviEL+2TVA/6PqIi9fuoocXqWn1Sc8riqd3tCF96S8aeZApVu88YeXcO+vweb0sBKWScUVThx/VmOgJMn437e+9xwAzvoaFueXuDIlMxeaA6BvoJuKW+yaSWxd4ejDxwwpSAewvqacfTY1+mxOj6b09uu/Z3xkpChsHV1d3PvIZwFIxtZIK1GC17bAHey8E29jLRaHC0tFpc72o/ff54H7n9CVSHNex7Q72FiUSSVVf+nuO0J335GiCVwP+QlHFJKZinMtFNErCEhGwySjYa082pwe3PtrGD7zMz7/8FfFzFpQ2hGgpaIScla3HpzSRbpBRPFtRzQa2/auclx1dtZDfu3aZiuDtW0Mjk4neLDKxr5Se4pdepx4UlVYWrsBQDC8ihKL61zmvs/103J7HSbAVWvnzG9e5MEHnhQza0FJx+CLZ6foavdyqMOh9w8pD1NiGzqRUcyzlveCgosyQB2OyZeRw6vMLytMLM5KPmejaPhkE+WWO/F4ajSbtBBGH3ys18vodALGAx+r/l69ntDSrDw7r859B/hXzLx2NqxrvSYWZ6WhodOiubVJA3hlSjbmweF3Q8izZrravdzdVkN5pUNL4MOjcyUB9NZacavmBGu9LEwHePUyQGpX22RK6CqIjsGLcoqLcoCBexLAnPayDle6JIDj4QQjF+dz5i3e1mLOkJsJSg3gY3eQWSXatqhjFfheSLvHzFq1nYlF47PchjdvqdtwNPCDL1lVH9wGci+Atdyawr9CUVucjXjDFo9OJ/DWWlUf/IxP88EXXvlXSYC62r2aDy6EIrwzqeBfMRe0qf9EdWEGDzVbVaeOkgmKOV10lyKj03ofBGi5VXWTv+7CXrYDz8tgdZUN9347h+xqHlwJyyzOL2nbXqwcaraSdDmJRmNY7XamA+EddXtafeLUL3+E1WIikUyjxOIkViMUrMXZJG0tA1ednS/U2ncsI0JkA07SJfYwYE3qy0xiNULv4U56D3dqD44/82UsDhcA4Y/U/Pv84EsUrMV6DPkKrdh6pP0LDejV2etaidsu/Y8O4G2sxWyxYbJvVazrM5MshCKMj4xoVaQogCpDwlCTs8wJsXP93U3SSpSNTDu2EIqgxOL86rU/795u6doEKWffJJW8rW3Nt5jSupnsPSUW56mnv6ttbdEAt5gTICCNpF6Jm8uJ2W4meyKhxOIMfv/HzF5bZSbPWY4GMBmLQ5VN1wnf2IgjSZAGTEgIITBJO3dYWV1dYCiK7jP23X+GNB8zoeoXOmTSAF4LRbBUlKu1cENdocg4mYTQQIkC1AkBQfm6gbFc2b6FRX12zqwFpW988yQLoQhT0/oXCKm4+SSTVDBAApfGkLeBLemzE2B6KkBzaxOyLGm9mSnbp0oZ/8vDoCwvGYAlFEXHnt//IbNzayUDLMsOIsrKd/yXZ56rMqepb/Cwsp5iaUkhJcCyz8xmGtJpwWYawy+yFCehKGzeuKH9csEFLo3xp5HL+Jflks8I854PHu3vUb/mPn1v0RMpsbiuC8lWjqGh01p7v6cnrAcq3eKeu9WDnmLOVXIBvnnmZcYnwh/rZLWkM+oDle6CWS8tBKZMMKWFwAR5c9rNyH8AVqsdkr7THRUAAAAASUVORK5CYII=';
const MugStatic = {
  size: 40, image: null, ready: false,
  draw(ctx, x, baseline) {
    if (!this.ready) return false;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.image, Math.round(x), Math.round(baseline - this.size));
    ctx.restore();
    return true;
  },
  init() {
    const im = new Image();
    this.image = im;
    im.onload = () => {
      if (im.naturalWidth !== this.size || im.naturalHeight !== this.size) return;
      this.ready = true;
      if (typeof OFFICE !== 'undefined') { OFFICE.last = 0; OFFICE.key = ''; }
    };
    im.onerror = () => console.warn('Falha ao carregar a caneca; mantendo o desenho original.');
    im.src = MUG_STATIC_PNG;
  }
};
MugStatic.init();
