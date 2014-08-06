var colorPalette = [
  {R:255, G:0, B:0},
  {R:255, G:51, B:0},
  {R:255, G:102, B:0},
  {R:255, G:153, B:0},
  {R:255, G:204, B:0},
  {R:255, G:255, B:0},
  {R:204, G:255, B:0},
  {R:153, G:255, B:0},
  {R:102, G:255, B:0},
  {R:51, G:255, B:0},
  {R:0, G:255, B:0},
  {R:0, G:255, B:51},
  {R:0, G:255, B:102},
  {R:0, G:255, B:153},
  {R:0, G:255, B:204},
  {R:0, G:255, B:255},
  {R:0, G:204, B:255},
  {R:0, G:153, B:255},
  {R:0, G:102, B:255},
  {R:0, G:51, B:255},
  {R:0, G:0, B:255},
  {R:51, G:0, B:255},
  {R:102, G:0, B:255},
  {R:153, G:0, B:255},
  {R:204, G:0, B:255},
  {R:255, G:0, B:255},
  {R:255, G:0, B:204},
  {R:255, G:0, B:153},
  {R:255, G:0, B:102},
  {R:255, G:0, B:51}
];

(function(exports) {

  function rgb2lch(color) {
    return lab2lch(xyz2lab(rgb2xyz(color)));
  }

  function rgb2lab(color) {
    return xyz2lab(rgb2xyz(color));
  }

  function rgb2xyz(color) {
    // Based on http://www.easyrgb.com/index.php?X=MATH&H=02
    var R = (color.R / 255);
    var G = (color.G / 255);
    var B = (color.B / 255);

    if (R > 0.04045) {
      R = Math.pow(((R + 0.055) / 1.055), 2.4);
    } else {
      R = R / 12.92 * 100;
    }
    if (G > 0.04045) {
      G = Math.pow(( ( G + 0.055 ) / 1.055 ),2.4);
    } else {
      G = G / 12.92 * 100;
    }
    if (B > 0.04045) {
      B = Math.pow(( ( B + 0.055 ) / 1.055 ), 2.4);
    } else {
      B = B / 12.92 * 100;
    }

    var X = R * 0.4124 + G * 0.3576 + B * 0.1805;
    var Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    var Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
    return {'X': X, 'Y': Y, 'Z': Z};
  }

  function xyz2lab(color) {
    // Based on http://www.easyrgb.com/index.php?X=MATH&H=07
    var ref_X = 95.047;
    var ref_Y = 100.000;
    var ref_Z = 108.883;
    var Y = color.Y / ref_Y;
    var Z = color.Z / ref_Z;
    var X = color.X / ref_X;
    if (X > 0.008856) {
      X = Math.pow(X, 1/3);
    } else {
      X = (7.787 * X) + (16 / 116);
    }
    if (Y > 0.008856) {
      Y = Math.pow(Y, 1/3);
    } else {
      Y = (7.787 * Y) + (16 / 116);
    }
    if (Z > 0.008856) {
      Z = Math.pow(Z, 1/3);
    } else {
      Z = (7.787 * Z) + (16 / 116);
    }
    var L = (116 * Y) - 16;
    var a = 500 * (X - Y);
    var b = 200 * (Y - Z);
    return {'L': L, 'a': a, 'b': b};
  }

  function lab2lch(color) {
    var L = color.L;
    var a = color.a;
    var b = color.b;
    var C = Math.sqrt(a * a + b * b);
    var h = _degrees(Math.atan2(a, b));
    return {'L': L, 'C': C, 'h': h};
  }

  function cie76(color1, color2) {
    var L1 = color1.L;
    var a1 = color1.a;
    var b1 = color1.b;

    var L2 = color2.L;
    var a2 = color2.a;
    var b2 = color2.b;

    var dE = Math.sqrt(
                Math.pow(L2 - L1) +
                Math.pow(a2 - a1) +
                Math.pow(b2 - b1)
             );
    return dE;
  }

  function ciede2000(color1, color2) {
    var L1 = color1.L;
    var c1 = color1.C;
    var h1 = color1.h;

    var L2 = color2.L;
    var c2 = color2.C;
    var h2 = color2.h;

    var kL = 1;
    var kC = 1;
    var kH = 1;

    var C1 = Math.sqrt(Math.pow(c1, 2) + Math.pow(h1, 2));
    var C2 = Math.sqrt(Math.pow(c2, 2) + Math.pow(h2, 2));

    var aC1C2 = (C1 + C2) / 2.0;

    var G = 0.5 * (1 - Math.sqrt(Math.pow(aC1C2 , 7.0) /
            (Math.pow(aC1C2, 7.0) + Math.pow(25.0, 7.0))));

    var c1p = (1.0 + G) * c1;
    var c2p = (1.0 + G) * c2;

    var C1p = Math.sqrt(Math.pow(c1p, 2) + Math.pow(h1, 2));
    var C2p = Math.sqrt(Math.pow(c2p, 2) + Math.pow(h2, 2));

    var hpF = function(x, y) {
      if(x === 0 && y === 0) {
        return 0;
      } else {
        var tmphp = _degrees(Math.atan2(x, y));
        if (tmphp >= 0) {
          return tmphp;
        } else {
          return tmphp + 360;
        }
      }
    };

    var h1p = hpF(h1, c1p);
    var h2p = hpF(h2, c2p);

    var dLp = L2 - L1;
    var dCp = C2p - C1p;

    var dhpF = function(C1, C2, h1p, h2p) {
      if (C1 * C2 === 0) {
        return 0;
      } else if (Math.abs(h2p - h1p) <= 180) {
        return h2p - h1p;
      } else if ((h2p - h1p) > 180) {
        return (h2p - h1p) - 360;
      } else if ((h2p - h1p) < -180) {
        return (h2p - h1p) + 360;
      } else {
        throw(new Error());
      }
    };
    var dhp = dhpF(C1, C2, h1p, h2p);
    var dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(_radians(dhp)/2.0);

    var aL = (L1 + L2) / 2.0;
    var aCp = (C1p + C2p) / 2.0;

    var ahpF = function(C1, C2, h1p, h2p) {
      if (C1 * C2 === 0) {
        return h1p + h2p;
      } else if (Math.abs(h1p - h2p) <= 180) {
        return (h1p + h2p) / 2.0;
      } else if ((Math.abs(h1p - h2p) > 180) && ((h1p+h2p) < 360)) {
        return (h1p + h2p + 360) / 2.0;
      } else if ((Math.abs(h1p - h2p) > 180) && ((h1p+h2p) >= 360)) {
        return (h1p + h2p - 360) / 2.0;
      } else {
        throw(new Error());
      }
    };
    var ahp = ahpF(C1, C2, h1p, h2p);
    var T = 1 - 0.17 * Math.cos(_radians(ahp - 30)) +
            0.24 * Math.cos(_radians(2 * ahp)) +
            0.32 * Math.cos(_radians(3 * ahp + 6)) -
            0.20 * Math.cos(_radians(4 * ahp - 63));
    var dro = 30 * Math.exp(-(Math.pow((ahp - 275) / 25, 2)));
    var RC = Math.sqrt(
               (Math.pow(aCp, 7.0)) /
               (Math.pow(aCp, 7.0) + Math.pow(25.0, 7.0))
             );
    var SL = 1 + ((0.015 * Math.pow(aL - 50, 2)) /
                  Math.sqrt(20 + Math.pow(aL - 50, 2.0)));
    var SC = 1 + 0.045 * aCp;
    var SH = 1 + 0.015 * aCp * T;
    var RT = -2 * RC * Math.sin(_radians(2 * dro));
    var dE = Math.sqrt(
               Math.pow(dLp / (SL * kL), 2) +
               Math.pow(dCp / (SC * kC), 2) +
               Math.pow(dHp / (SH * kH), 2) +
               RT * (dCp / (SC * kC)) * (dHp / (SH * kH))
             );
    return dE;
  }

  function _degrees(n) {
    return n * (180 / Math.PI);
  }

  function _radians(n) {
    return n * (Math.PI / 180);
  }

  function paletteMapKey(color) {
    return "R" + color.R + "G" + color.G + "B" + color.B;
  }

  function mapPalette(a, b) {
    var c = {};
    for (var idx1 in a) {
      color1 = a[idx1];
      var bestColor;
      var bestDiff;
      for (var idx2 in b) {
        color2 = b[idx2];
        var currentDiff = diff(color1, color2);
        if(!bestColor || (currentDiff < bestDiff)) {
          bestColor = color2;
          bestDiff = currentDiff;
        }
      }
      c[paletteMapKey(color1)] = bestColor;
    }
    return c;
  }

  function diff(color1, color2) {
    color1 = rgb2lch(color1);
    color2 = rgb2lch(color2);
    return ciede2000(color1, color2);
  }

  var colorDiff = {
    closest: function(target, relative) {
      var key = paletteMapKey(target);
      var result = mapPalette([target], relative);
      var rgb = result[key];
      return [rgb.R, rgb.G, rgb.B];
    }
  };

  exports.colorDiff = colorDiff;

})(this);
