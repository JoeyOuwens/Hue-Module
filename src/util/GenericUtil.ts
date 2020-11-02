export const GenericUtil = {
  deepCopy(obj: any) {
    let clonedObj: any
    if (obj instanceof Array) {
      clonedObj = []
      for (let i = 0, len = obj.length; i < len; i++) {
        (typeof (obj[i]) === "object") ? clonedObj[i] = this.deepCopy(obj[i]) : clonedObj[i] = obj[i];
      }
      return clonedObj;
    }
    if (obj instanceof Object) {
      clonedObj = {}
      Object.keys(obj).forEach(key => {
        (typeof (obj[key]) === "object") ? clonedObj[key] = this.deepCopy(obj[key]) : clonedObj[key] = obj[key];

      })
      return clonedObj;
    }
  }
}