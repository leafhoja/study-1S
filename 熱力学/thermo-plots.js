/* 解答で使う式から点を計算し、熱力学のサイクルをSVGの曲線・矢印・状態点で示す。 */
(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  // ある範囲の数値を、別の範囲の位置へ同じ割合で換算する。
  function linearMap(value, domainMin, domainMax, rangeMin, rangeMax) {
    return rangeMin + (value - domainMin) * (rangeMax - rangeMin) / (domainMax - domainMin);
  }

  // グラフの横軸・縦軸の値を、SVG画像の中の座標へ換算する関数を用意する。
  function plotMap({ xMin, xMax, yMin, yMax }) {
    return ([x, y]) => [
      linearMap(x, xMin, xMax, 65, 485),
      linearMap(y, yMin, yMax, 280, 25)
    ];
  }

  // 式に沿って細かく点を計算し、それらを結ぶSVGの線の指定を作る。
  function sampledPath(start, end, equation, map, steps = 240) {
    const points = [];
    for (let i = 0; i <= steps; i += 1) {
      const parameter = start + (end - start) * i / steps;
      const [x, y] = map(equation(parameter));
      points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(' ');
  }

  // 指定された曲線の式を計算し、画像内の対応する線の形を更新する。
  function path(svg, name, start, end, equation, map) {
    const element = svg.querySelector(`[data-curve="${name}"]`);
    if (element) element.setAttribute('d', sampledPath(start, end, equation, map));
  }

  // 曲線の途中の短い区間を使い、変化の向きを示す矢印の線を更新する。
  function arrow(svg, name, start, end, equation, map) {
    const element = svg.querySelector(`[data-arrow="${name}"]`);
    if (!element) return;
    const from = start + 0.40 * (end - start);
    const to = start + 0.58 * (end - start);
    element.setAttribute('d', sampledPath(from, to, equation, map, 48));
  }

  // 状態を表す点と、その名前の位置をグラフ上の座標に合わせる。
  function state(svg, name, point, map) {
    const [x, y] = map(point);
    const circle = svg.querySelector(`[data-state="${name}"]`);
    const label = svg.querySelector(`[data-state-label="${name}"]`);
    if (circle) {
      circle.setAttribute('cx', x.toFixed(2));
      circle.setAttribute('cy', y.toFixed(2));
    }
    if (label) {
      const dx = Number(label.dataset.dx || 7);
      const dy = Number(label.dataset.dy || -7);
      label.setAttribute('x', (x + dx).toFixed(2));
      label.setAttribute('y', (y + dy).toFixed(2));
    }
  }

  // 理想気体の式から、カルノーサイクルの曲線・矢印・状態点を配置する。
  function drawIdealGasCarnot(svg) {
    // Normalized units: nR=1, Th=2, Tc=1.2, gamma=5/3.
    const hotTemperature = 2;
    const coldTemperature = 1.2;
    const gamma = 5 / 3;
    const volumeA = 1;
    const volumeB = 1.5;
    const adiabaticVolumeRatio = Math.pow(hotTemperature / coldTemperature, 1 / (gamma - 1));
    const volumeD = volumeA * adiabaticVolumeRatio;
    const volumeC = volumeB * adiabaticVolumeRatio;
    const map = plotMap({ xMin: 0.7, xMax: 3.5, yMin: 0, yMax: 2.2 });

    // 温度一定の曲線と、熱を出し入れしない変化の曲線を、式から用意する。
    const hotIsotherm = volume => [volume, hotTemperature / volume];
    const coldIsotherm = volume => [volume, coldTemperature / volume];
    const adiabaticBCConstant = hotTemperature * Math.pow(volumeB, gamma - 1);
    const adiabaticDAConstant = hotTemperature * Math.pow(volumeA, gamma - 1);
    const adiabaticBC = volume => [volume, adiabaticBCConstant / Math.pow(volume, gamma)];
    const adiabaticDA = volume => [volume, adiabaticDAConstant / Math.pow(volume, gamma)];

    // 求めた曲線を画像に反映し、その上に変化の向きと状態点を置く。
    path(svg, 'hot', volumeA, volumeB, hotIsotherm, map);
    path(svg, 'expand-adiabatic', volumeB, volumeC, adiabaticBC, map);
    path(svg, 'cold', volumeC, volumeD, coldIsotherm, map);
    path(svg, 'compress-adiabatic', volumeD, volumeA, adiabaticDA, map);
    arrow(svg, 'hot', volumeA, volumeB, hotIsotherm, map);
    arrow(svg, 'expand-adiabatic', volumeB, volumeC, adiabaticBC, map);
    arrow(svg, 'cold', volumeC, volumeD, coldIsotherm, map);
    arrow(svg, 'compress-adiabatic', volumeD, volumeA, adiabaticDA, map);

    state(svg, '1', hotIsotherm(volumeA), map);
    state(svg, '2', hotIsotherm(volumeB), map);
    state(svg, '3', coldIsotherm(volumeC), map);
    state(svg, '4', coldIsotherm(volumeD), map);
  }

  // 磁化と磁場の式から、磁性体のカルノーサイクルをグラフに示す。
  function drawMagnetCarnot(svg) {
    // Normalized units: A=C_M=1.  M=AH/T and
    // T(M)=T0 exp[(M^2-M0^2)/(2AC_M)] on an adiabat.
    const A = 1;
    const heatCapacityM = 1;
    const hotTemperature = 2;
    const coldTemperature = 1.4;
    const magnetizationA = 1.4;
    const magnetizationB = 1.1;
    const deltaSquared = 2 * A * heatCapacityM * Math.log(hotTemperature / coldTemperature);
    const magnetizationC = Math.sqrt(magnetizationB ** 2 - deltaSquared);
    const magnetizationD = Math.sqrt(magnetizationA ** 2 - deltaSquared);
    const map = plotMap({ xMin: 0, xMax: 1.55, yMin: 0, yMax: 3.1 });

    // Horizontal M and vertical H, just as V is horizontal and P vertical.
    const isotherm = temperature => magnetization => [magnetization, temperature * magnetization / A];
    const adiabat = (anchorM, anchorT) => magnetization => {
      const temperature = anchorT * Math.exp((magnetization ** 2 - anchorM ** 2) / (2 * A * heatCapacityM));
      return [magnetization, temperature * magnetization / A];
    };
    const hot = isotherm(hotTemperature);
    const cold = isotherm(coldTemperature);
    const expandAdiabatic = adiabat(magnetizationB, hotTemperature);
    const compressAdiabatic = adiabat(magnetizationD, coldTemperature);

    // 求めた曲線を画像に反映し、その上に変化の向きと状態点を置く。
    path(svg, 'hot', magnetizationA, magnetizationB, hot, map);
    path(svg, 'demagnetize-adiabatic', magnetizationB, magnetizationC, expandAdiabatic, map);
    path(svg, 'cold', magnetizationC, magnetizationD, cold, map);
    path(svg, 'magnetize-adiabatic', magnetizationD, magnetizationA, compressAdiabatic, map);
    arrow(svg, 'hot', magnetizationA, magnetizationB, hot, map);
    arrow(svg, 'demagnetize-adiabatic', magnetizationB, magnetizationC, expandAdiabatic, map);
    arrow(svg, 'cold', magnetizationC, magnetizationD, cold, map);
    arrow(svg, 'magnetize-adiabatic', magnetizationD, magnetizationA, compressAdiabatic, map);

    state(svg, '1', hot(magnetizationA), map);
    state(svg, '2', hot(magnetizationB), map);
    state(svg, '3', cold(magnetizationC), map);
    state(svg, '4', cold(magnetizationD), map);
  }

  // 値が増える関数について、範囲を繰り返し半分に絞り、目標値になる位置を求める。
  function increasingRoot(target, low, high, fn) {
    let left = low;
    let right = high;
    for (let i = 0; i < 80; i += 1) {
      const middle = (left + right) / 2;
      if (fn(middle) < target) left = middle;
      else right = middle;
    }
    return (left + right) / 2;
  }

  // ゴムの長さ・張力・温度の式から、カルノーサイクルをグラフに示す。
  function drawRubberCarnot(svg) {
    // Normalized units: l0=A=1, A*l0/C_l=0.5.
    // X=T(q-q^-2), q=l/l0, and T=C exp[k(q^2/2+1/q)].
    const hotTemperature = 2;
    const coldTemperature = 1.4;
    const k = 0.5;
    const lengthA = 2.6;
    const lengthB = 2.0;
    const entropyPrimitive = q => q ** 2 / 2 + 1 / q;
    const shift = Math.log(coldTemperature / hotTemperature) / k;
    const lengthC = increasingRoot(entropyPrimitive(lengthB) + shift, 1, lengthB, entropyPrimitive);
    const lengthD = increasingRoot(entropyPrimitive(lengthA) + shift, 1, lengthA, entropyPrimitive);
    const map = plotMap({ xMin: 1.15, xMax: 2.8, yMin: 0, yMax: 5.25 });

    const force = (temperature, q) => temperature * (q - q ** -2);
    const isotherm = temperature => q => [q, force(temperature, q)];
    const adiabat = (anchorLength, anchorTemperature) => q => {
      const temperature = anchorTemperature * Math.exp(k * (entropyPrimitive(q) - entropyPrimitive(anchorLength)));
      return [q, force(temperature, q)];
    };
    const hot = isotherm(hotTemperature);
    const cold = isotherm(coldTemperature);
    const coolAdiabatic = adiabat(lengthB, hotTemperature);
    const warmAdiabatic = adiabat(lengthD, coldTemperature);

    // 求めた曲線を画像に反映し、その上に変化の向きと状態点を置く。
    path(svg, 'hot', lengthA, lengthB, hot, map);
    path(svg, 'cool-adiabatic', lengthB, lengthC, coolAdiabatic, map);
    path(svg, 'cold', lengthC, lengthD, cold, map);
    path(svg, 'warm-adiabatic', lengthD, lengthA, warmAdiabatic, map);
    arrow(svg, 'hot', lengthA, lengthB, hot, map);
    arrow(svg, 'cool-adiabatic', lengthB, lengthC, coolAdiabatic, map);
    arrow(svg, 'cold', lengthC, lengthD, cold, map);
    arrow(svg, 'warm-adiabatic', lengthD, lengthA, warmAdiabatic, map);

    state(svg, '1', hot(lengthA), map);
    state(svg, '2', hot(lengthB), map);
    state(svg, '3', cold(lengthC), map);
    state(svg, '4', cold(lengthD), map);
  }

  // 光子気体の温度・体積・圧力の式から、カルノーサイクルをグラフに示す。
  function drawPhotonCarnot(svg) {
    // Normalized units: alpha/3=1, so P=T^4 (isotherms are horizontal) and V*T^3=const (adiabats).
    const hotTemperature = 2;
    const coldTemperature = 1.4;
    const volumeA = 1;
    const volumeB = 1.5;
    const adiabaticVolumeRatio = Math.pow(hotTemperature / coldTemperature, 3);
    const volumeD = volumeA * adiabaticVolumeRatio;
    const volumeC = volumeB * adiabaticVolumeRatio;
    const map = plotMap({ xMin: 0.7, xMax: 5.2, yMin: 0, yMax: 17 });

    // 温度一定の曲線と、熱を出し入れしない変化の曲線を、式から用意する。
    const hotIsotherm = volume => [volume, hotTemperature ** 4];
    const coldIsotherm = volume => [volume, coldTemperature ** 4];
    const adiabaticBC = volume => [volume, (hotTemperature * Math.pow(volumeB / volume, 1 / 3)) ** 4];
    const adiabaticDA = volume => [volume, (hotTemperature * Math.pow(volumeA / volume, 1 / 3)) ** 4];

    // 求めた曲線を画像に反映し、その上に変化の向きと状態点を置く。
    path(svg, 'hot', volumeA, volumeB, hotIsotherm, map);
    path(svg, 'expand-adiabatic', volumeB, volumeC, adiabaticBC, map);
    path(svg, 'cold', volumeC, volumeD, coldIsotherm, map);
    path(svg, 'compress-adiabatic', volumeD, volumeA, adiabaticDA, map);
    arrow(svg, 'hot', volumeA, volumeB, hotIsotherm, map);
    arrow(svg, 'expand-adiabatic', volumeB, volumeC, adiabaticBC, map);
    arrow(svg, 'cold', volumeC, volumeD, coldIsotherm, map);
    arrow(svg, 'compress-adiabatic', volumeD, volumeA, adiabaticDA, map);

    state(svg, '1', hotIsotherm(volumeA), map);
    state(svg, '2', hotIsotherm(volumeB), map);
    state(svg, '3', coldIsotherm(volumeC), map);
    state(svg, '4', coldIsotherm(volumeD), map);
  }

  // グラフの種類を示す名前と、そのグラフを作る関数を対応させる。
  const renderers = {
    'ideal-gas-carnot': drawIdealGasCarnot,
    'magnet-carnot': drawMagnetCarnot,
    'rubber-carnot': drawRubberCarnot,
    'photon-carnot': drawPhotonCarnot
  };

  // ページ内の各グラフについて、指定された種類に対応する計算を実行する。
  document.querySelectorAll('[data-thermo-plot]').forEach(svg => {
    const renderer = renderers[svg.dataset.thermoPlot];
    if (renderer) renderer(svg);
  });
})();
