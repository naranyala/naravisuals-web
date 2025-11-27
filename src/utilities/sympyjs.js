// sympyjs.js - Fixed version

class Expr {
  toString() {
    return this.toStr();
  }

  subs(symbol, value) {
    if (this.equals(symbol)) {
      return normalize(value);
    }
    return this;
  }

  simplify() {
    return this;
  }

  expand() {
    return this;
  }

  factor() {
    return this;
  }

  equals(other) {
    return this.constructor === other.constructor;
  }
}

function normalize(expr) {
  if (typeof expr === 'number') return new NumberExpr(expr);
  if (typeof expr === 'string') return new Symbol(expr);
  if (expr instanceof Expr) return expr;
  return new NumberExpr(expr);
}

class Symbol extends Expr {
  constructor(name) {
    super();
    this.name = name;
  }

  toStr() {
    return this.name;
  }

  equals(other) {
    return other instanceof Symbol && this.name === other.name;
  }

  subs(symbol, value) {
    return this.equals(symbol) ? normalize(value) : this;
  }
}

class NumberExpr extends Expr {
  constructor(value) {
    super();
    this.value = Number(value);
  }

  toStr() {
    return String(this.value);
  }

  equals(other) {
    return other instanceof NumberExpr && this.value === other.value;
  }

  subs() {
    return this;
  }
}

class Add extends Expr {
  constructor(...terms) {
    super();
    this.terms = terms.flat().map(t => normalize(t));
  }

  toStr() {
    if (this.terms.length === 0) return '0';
    return this.terms.map((t, i) => {
      const str = t.toStr();
      if (i === 0) return str;
      // Check if term is negative
      if (t instanceof NumberExpr && t.value < 0) {
        return `- ${Math.abs(t.value)}`;
      }
      return `+ ${str}`;
    }).join(' ');
  }

  subs(symbol, value) {
    return new Add(...this.terms.map(t => t.subs(symbol, value))).simplify();
  }

  simplify() {
    const terms = this.terms.map(t => t.simplify());
    
    let numSum = 0;
    const nonNum = [];
    
    for (const t of terms) {
      if (t instanceof NumberExpr) {
        numSum += t.value;
      } else {
        nonNum.push(t);
      }
    }
    
    if (numSum !== 0 || nonNum.length === 0) {
      nonNum.push(new NumberExpr(numSum));
    }
    
    if (nonNum.length === 0) return new NumberExpr(0);
    if (nonNum.length === 1) return nonNum[0];
    
    return new Add(...nonNum);
  }

  equals(other) {
    if (!(other instanceof Add)) return false;
    if (this.terms.length !== other.terms.length) return false;
    
    const otherTerms = [...other.terms];
    for (const t of this.terms) {
      const idx = otherTerms.findIndex(ot => t.equals(ot));
      if (idx === -1) return false;
      otherTerms.splice(idx, 1);
    }
    return true;
  }
}

class Mul extends Expr {
  constructor(...factors) {
    super();
    this.factors = factors.flat().map(f => normalize(f));
  }

  toStr() {
    if (this.factors.length === 0) return '1';
    return this.factors.map(f => {
      const str = f.toStr();
      // Wrap Add expressions in parentheses
      if (f instanceof Add || f instanceof Pow) {
        return `(${str})`;
      }
      return str;
    }).join(' * ');
  }

  subs(symbol, value) {
    return new Mul(...this.factors.map(f => f.subs(symbol, value))).simplify();
  }

  simplify() {
    const factors = this.factors.map(f => f.simplify());
    
    let numProd = 1;
    const nonNum = [];
    
    for (const f of factors) {
      if (f instanceof NumberExpr) {
        numProd *= f.value;
      } else {
        nonNum.push(f);
      }
    }
    
    if (numProd === 0) return new NumberExpr(0);
    
    if (numProd !== 1 || nonNum.length === 0) {
      if (numProd !== 1) {
        nonNum.unshift(new NumberExpr(numProd));
      }
    }
    
    if (nonNum.length === 0) return new NumberExpr(1);
    if (nonNum.length === 1) return nonNum[0];
    
    return new Mul(...nonNum);
  }

  equals(other) {
    if (!(other instanceof Mul)) return false;
    if (this.factors.length !== other.factors.length) return false;
    
    const otherFactors = [...other.factors];
    for (const f of this.factors) {
      const idx = otherFactors.findIndex(of => f.equals(of));
      if (idx === -1) return false;
      otherFactors.splice(idx, 1);
    }
    return true;
  }
}

class Pow extends Expr {
  constructor(base, exp) {
    super();
    this.base = normalize(base);
    this.exp = normalize(exp);
  }

  toStr() {
    const baseStr = (this.base instanceof Add || this.base instanceof Mul) 
      ? `(${this.base.toStr()})` 
      : this.base.toStr();
    const expStr = (this.exp instanceof Add || this.exp instanceof Mul || this.exp instanceof Pow) 
      ? `(${this.exp.toStr()})` 
      : this.exp.toStr();
    return `${baseStr}^${expStr}`;
  }

  subs(symbol, value) {
    const newBase = this.base.subs(symbol, value);
    const newExp = this.exp.subs(symbol, value);
    
    // If both are numbers, compute the result
    if (newBase instanceof NumberExpr && newExp instanceof NumberExpr) {
      return new NumberExpr(Math.pow(newBase.value, newExp.value));
    }
    
    return new Pow(newBase, newExp);
  }

  expand() {
    // Expand (a + b)^2 = a^2 + 2ab + b^2
    if (this.exp instanceof NumberExpr && this.exp.value === 2) {
      if (this.base instanceof Add && this.base.terms.length === 2) {
        const [a, b] = this.base.terms;
        
        // a^2
        const a2 = new Pow(a, new NumberExpr(2));
        
        // 2ab
        const ab2 = new Mul(new NumberExpr(2), a, b);
        
        // b^2
        const b2 = new Pow(b, new NumberExpr(2));
        
        return new Add(a2, ab2, b2).simplify();
      }
    }
    
    // Expand (a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3
    if (this.exp instanceof NumberExpr && this.exp.value === 3) {
      if (this.base instanceof Add && this.base.terms.length === 2) {
        const [a, b] = this.base.terms;
        
        const a3 = new Pow(a, new NumberExpr(3));
        const a2b3 = new Mul(new NumberExpr(3), new Pow(a, new NumberExpr(2)), b);
        const ab23 = new Mul(new NumberExpr(3), a, new Pow(b, new NumberExpr(2)));
        const b3 = new Pow(b, new NumberExpr(3));
        
        return new Add(a3, a2b3, ab23, b3).simplify();
      }
    }
    
    return this;
  }

  simplify() {
    const base = this.base.simplify();
    const exp = this.exp.simplify();
    
    // number^number = compute
    if (base instanceof NumberExpr && exp instanceof NumberExpr) {
      return new NumberExpr(Math.pow(base.value, exp.value));
    }
    
    // x^0 = 1
    if (exp instanceof NumberExpr && exp.value === 0) {
      return new NumberExpr(1);
    }
    
    // x^1 = x
    if (exp instanceof NumberExpr && exp.value === 1) {
      return base;
    }
    
    return new Pow(base, exp);
  }

  equals(other) {
    return other instanceof Pow && 
           this.base.equals(other.base) && 
           this.exp.equals(other.exp);
  }
}

// Public API
const sympyInspired = {
  Symbol: (name) => new Symbol(name),
  add: (...terms) => new Add(...terms),
  mul: (...factors) => new Mul(...factors),
  pow: (base, exp) => new Pow(base, exp),
  number: (val) => new NumberExpr(val)
};

export default sympyInspired;
