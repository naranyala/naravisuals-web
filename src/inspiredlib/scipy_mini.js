/* -------------- tiny ndarray (1-D only for brevity) -------------- */
class array extends Float64Array {
  constructor(arg) {
    if (typeof arg === 'number') super(arg);          // length
    else super(arg);                                    // array-like
    this.shape = [this.length];
  }
  /* basic ufuncs */
  sin()   { const r = new array(this.length); for (let i = 0; i < this.length; ++i) r[i] = Math.sin(this[i]); return r; }
  add(b)  { const r = new array(this.length); for (let i = 0; i < this.length; ++i) r[i] = this[i] + b[i];   return r; }
  mul(k)  { const r = new array(this.length); for (let i = 0; i < this.length; ++i) r[i] = this[i] * k;      return r; }
}

/* -------------- linear algebra -------------- */
const linalg = {
  /* solve A·x = b  (in-place, LU without pivoting) */
  solve: (A, b) => {
    const n = Math.sqrt(A.length);
    const LU = A.slice();                 // copy
    const x  = b.slice();
    /* ---- LU decomposition (Crout) ---- */
    for (let j = 0; j < n; ++j) {
      for (let i = j; i < n; ++i) {          // U[j][j] = 1 implicit
        let sum = 0;
        for (let k = 0; k < j; ++k) sum += LU[i * n + k] * LU[k * n + j];
        LU[i * n + j] -= sum;
      }
      for (let i = j + 1; i < n; ++i) {
        let sum = 0;
        for (let k = 0; k < j; ++k) sum += LU[j * n + k] * LU[k * n + i];
        LU[j * n + i] = (LU[j * n + i] - sum) / LU[j * n + j];
      }
    }
    /* ---- forward ---- */
    for (let i = 0; i < n; ++i) {
      let sum = x[i];
      for (let j = 0; j < i; ++j) sum -= LU[i * n + j] * x[j];
      x[i] = sum / LU[i * n + i];
    }
    /* ---- backward ---- */
    for (let i = n - 1; i >= 0; --i) {
      let sum = x[i];
      for (let j = i + 1; j < n; ++j) sum -= LU[i * n + j] * x[j];
      x[i] = sum;
    }
    return x;
  }
};

/* -------------- FFT (radix-2, complex) -------------- */
function cexp(z) { const r = Math.exp(z.re); return {re: r * Math.cos(z.im), im: r * Math.sin(z.im)}; }
function cadd(a, b) { return {re: a.re + b.re, im: a.im + b.im}; }
function csub(a, b) { return {re: a.re - b.re, im: a.im - b.im}; }
function cmul(a, b) { return {re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re}; }

const fft = (() => {
  /* bit-reverse copy */
  function bitReverse(n, out) {
    const rev = new Uint32Array(n);
    let j = 0;
    for (let i = 1; i < n; ++i) {
      let bit = n >> 1;
      while (j & bit) { j ^= bit; bit >>= 1; }
      j ^= bit;
      rev[i] = j;
    }
    const tmp = out.slice();
    for (let i = 0; i < n; ++i) out[i] = tmp[rev[i]];
  }
  /* in-place Cooley–Tukey, sign = -1 forward, +1 inverse */
  return function fft(out, sign = -1) {
    const n = out.length;
    if (n & (n - 1)) throw new Error('FFT size must be power of 2');
    bitReverse(n, out);
    for (let len = 2; len <= n; len <<= 1) {
      const angle = sign * 2 * Math.PI / len;
      const wlen = {re: Math.cos(angle), im: Math.sin(angle)};
      for (let i = 0; i < n; i += len) {
        let w = {re: 1, im: 0};
        for (let j = 0; j < len / 2; ++j) {
          const u = out[i + j];
          const v = cmul(out[i + j + len / 2], w);
          out[i + j]            = cadd(u, v);
          out[i + j + len / 2]  = csub(u, v);
          w = cmul(w, wlen);
        }
      }
    }
    if (sign === 1) for (let i = 0; i < n; ++i) { out[i].re /= n; out[i].im /= n; }
  };
})();

/* -------------- integration -------------- */
const integrate = {
  trapz: (y, x) => {
    let s = 0;
    for (let i = 1; i < y.length; ++i) s += (x[i] - x[i - 1]) * (y[i] + y[i - 1]);
    return s * 0.5;
  }
};

/* -------------- root finding (Brent) -------------- */
const optimize = {
  brentq: (f, a, b, tol = 1e-10, maxIter = 100) => {
    let fa = f(a), fb = f(b);
    if (fa * fb > 0) return NaN;
    let c = a, fc = fa, d = b - a, e = d;
    for (let iter = 0; iter < maxIter; ++iter) {
      if (Math.abs(fc) < Math.abs(fb)) { a = b; b = c; c = a; fa = fb; fb = fc; fc = fa; }
      const m = 0.5 * (c - b);
      if (Math.abs(m) <= tol || fb === 0) return b;
      if (Math.abs(e) < tol || Math.abs(fa) <= Math.abs(fb)) { d = e = m; }
      else {
        let s = fb / fa;
        let p, q;
        if (a === c) { p = 2 * m * s; q = 1 - s; }
        else {
          const qf = fa / fc, rf = fb / fc;
          p = s * (2 * m * qf * (qf - rf) - (b - a) * (rf - 1));
          q = (qf - 1) * (rf - 1) * (s - 1);
        }
        if (p > 0) q = -q; p = Math.abs(p);
        if (2 * p < Math.min(3 * m * q - Math.abs(tol * q), Math.abs(e * q))) { e = d; d = p / q; }
        else { d = e = m; }
      }
      a = b; fa = fb;
      if (Math.abs(d) > tol) b += d;
      else b += (m > 0 ? tol : -tol);
      fb = f(b);
      if ((fb > 0 && fc > 0) || (fb < 0 && fc < 0)) { c = a; fc = fa; }
    }
    return b;
  }
};

/* -------------- special functions -------------- */
const special = {
  gamma: (function() {     // Lanczos ≈ 1e-10 relative
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    return function gamma(z) {
      if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * special.gamma(1 - z));
      z -= 1;
      let x = c[0];
      for (let i = 1; i < g + 2; ++i) x += c[i] / (z + i);
      const t = z + g + 0.5;
      return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    };
  })(),
  erf: (x) => {            // Abramowitz & Stegun 7.1.26
    const a1 =  0.254829592, a2 = -0.284496736, a3 =  1.421413741,
          a4 = -1.453152027, a5 =  1.061405429, p  =  0.3275911;
    const sign = x < 0 ? -1 : 1;  x = Math.abs(x);
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  },
  bessel0: (x) => {        // 0th-order Bessel J0, polynomial fit
    const ax = Math.abs(x);
    if (ax < 8) {
      const y = x * x;
      const ans1 = 57568490574.0 + y * (-<PHONE_NUMBER>.0 + y * (651619640.7 +
        y * (-11214424.18 + y * (77392.33017 + y * (-<PHONE_NUMBER>)))));
      const ans2 = 57568490411.0 + y * (1029532985.0 + y * (9494680.718 +
        y * (59272.64853 + y * (<PHONE_NUMBER> + y * 1.0))));
      return ans1 / ans2;
    } else {
      const z = 8 / ax;  const xx = ax - 0.785398164;
      const ans1 = 1 + z * (-0.1098628627e-2 + z * (0.2734510407e-4 +
        z * (-0.2073370639e-5 + z * 0.2093887211e-6)));
      const ans2 = -0.1562499995e-1 + z * (0.1430488765e-3 +
        z * (-0.6911147651e-5 + z * 0.7621095161e-6 - z * 0.934935152e-7));
      return Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2);
    }
  }
};

/* ------------------------------------------------------------------ */
/* -------------------------- demo ---------------------------------- */
/* ------------------------------------------------------------------ */
(function demo() {
  console.log('=== JS-SciPy mini demo ===');

  /* 1. array math */
  const x = new array(101).map((_, i) => i * Math.PI / 100);
  const y = x.sin();
  console.log('∫₀^π sin(x) dx ≈', integrate.trapz(y, x));  // → 1.999...

  /* 2. root */
  const root = optimize.brentq(x => x * x - 2, 0, 2);
  console.log('√2 via brentq =', root);                    // → 1.4142...

  /* 3. 3×3 system */
  const A = new array([2,1,1, 1,3,2, 1,0,0]);
  const b = new array([4,5,1]);
  const sol = linalg.solve(A, b);
  console.log('solve 3×3:', [...sol]);                    // → [1,1,1]

  /* 4. FFT */
  const N = 16;
  const z = new Array(N).fill(0).map((_, i) => ({re: Math.sin(2 * Math.PI * i / N), im: 0}));
  fft(z, -1);
  console.log('FFT bin 1 mag', Math.hypot(z[1].re, z[1].im) / (N / 2));  // → 1

  /* 5. special */
  console.log('Γ(5) =', special.gamma(5));               // → 24
  console.log('erf(1) =', special.erf(1));               // → 0.8427
  console.log('J₀(2) =', special.bessel0(2));            // → 0.22389
})();
