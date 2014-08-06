var colorPalette = [
  {R:255, G:0, B:0},
  {R:255, G:153, B:0},
  {R:255, G:255, B:0},
  {R:153, G:255, B:0},
  {R:0, G:255, B:0},
  {R:0, G:255, B:153},
  {R:0, G:255, B:255},
  {R:0, G:153, B:255},
  {R:0, G:0, B:255},
  {R:153, G:0, B:255},
  {R:255, G:0, B:255},
  {R:255, G:0, B:153}
];

(function(exports) {

  function rgb_to_lab(color) {
    return xyz_to_lab(rgb_to_xyz(color));
  }

  function rgb_to_xyz(color) {
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

    // Observer = 2°, Illuminant = D65
    var X = R * 0.4124 + G * 0.3576 + B * 0.1805;
    var Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    var Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
    return {'X' : X, 'Y' : Y, 'Z' : Z};
  }

  function xyz_to_lab(color) {
    // Based on http://www.easyrgb.com/index.php?X=MATH&H=07
    // Observer = 2°, Illuminant= D65
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
    return {'L' : L , 'a' : a, 'b' : b};
  }

  function ciede2000(color1, color2) {
    var L1 = color1.L;
    var a1 = color1.a;
    var b1 = color1.b;

    var L2 = color2.L;
    var a2 = color2.a;
    var b2 = color2.b;

    var kL = 1;
    var kC = 1;
    var kH = 1;

    /**
     * Step 1: Calculate C1p, C2p, h1p, h2p
     */
    var C1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
    var C2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));

    var a_C1_C2 = (C1 + C2) / 2.0;

    var G = 0.5 * (1 - Math.sqrt(Math.pow(a_C1_C2 , 7.0) /
            (Math.pow(a_C1_C2, 7.0) + Math.pow(25.0, 7.0))));

    var a1p = (1.0 + G) * a1;
    var a2p = (1.0 + G) * a2;

    var C1p = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1, 2));
    var C2p = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2, 2));

    var hp_f = function(x, y) {
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

    var h1p = hp_f(b1, a1p);
    var h2p = hp_f(b2, a2p);

    /**
     * Step 2: Calculate dLp, dCp, dHp
     */
    var dLp = L2 - L1;
    var dCp = C2p - C1p;

    var dhp_f = function(C1, C2, h1p, h2p) {
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
    var dhp = dhp_f(C1, C2, h1p, h2p);
    var dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(_radians(dhp)/2.0);

    /**
     * Step 3: Calculate CIEDE2000 Color-Difference
     */
    var a_L = (L1 + L2) / 2.0;
    var a_Cp = (C1p + C2p) / 2.0;

    var a_hp_f = function(C1, C2, h1p, h2p) {
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
    var a_hp = a_hp_f(C1, C2, h1p, h2p);
    var T = 1 - 0.17 * Math.cos(_radians(a_hp - 30)) +
            0.24 * Math.cos(_radians(2 * a_hp)) +
            0.32 * Math.cos(_radians(3 * a_hp + 6)) -
            0.20 * Math.cos(_radians(4 * a_hp - 63));
    var d_ro = 30 * Math.exp(-(Math.pow((a_hp - 275) / 25, 2)));
    var RC = Math.sqrt(
               (Math.pow(a_Cp, 7.0)) /
               (Math.pow(a_Cp, 7.0) + Math.pow(25.0, 7.0))
             );
    var SL = 1 + ((0.015 * Math.pow(a_L - 50, 2)) /
                  Math.sqrt(20 + Math.pow(a_L - 50, 2.0)));
    var SC = 1 + 0.045 * a_Cp;
    var SH = 1 + 0.015 * a_Cp * T;
    var RT = -2 * RC * Math.sin(_radians(2 * d_ro));
    var dE = Math.sqrt(
               Math.pow(dLp / (SL * kL), 2) +
               Math.pow(dCp / (SC * kC), 2) +
               Math.pow(dHp / (SH * kH), 2) +
               RT * (dCp /(SC * kC)) * (dHp / (SH * kH))
             );
    return dE;
  }

  function _degrees(n) {
    return n * (180 / Math.PI);
  }

  function _radians(n) {
    return n * (Math.PI / 180);
  }

  function palette_map_key(color) {
    return "R" + color.R + "B" + color.B + "G" + color.G;
  }

  function map_palette(a, b) {
    var c = {};
    for (var idx1 in a) {
      color1 = a[idx1];
      var best_color = undefined;
      var best_color_diff = undefined;
      for (var idx2 in b) {
        color2 = b[idx2];
        var current_color_diff = diff(color1, color2);
        if((best_color === undefined) ||
           (current_color_diff < best_color_diff)) {
          best_color = color2;
          best_color_diff = current_color_diff;
        }
      }
      c[palette_map_key(color1)] = best_color;
    }
    return c;
  }

  function diff(color1, color2) {
    color1 = rgb_to_lab(color1);
    color2 = rgb_to_lab(color2);
    return ciede2000(color1, color2);
  }

  var colorDiff = {
    closest: function(target, relative) {
      var key = palette_map_key(target);
      var result = map_palette([target], relative);
      var rgb = result[key];
      return [rgb.R, rgb.G, rgb.G];
    }
  };

  exports.colorDiff = colorDiff;

})(this);
