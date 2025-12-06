import { expect } from "@infra-blocks/test";
import { isNumber, isObjectNotNull } from "@infra-blocks/types";
import { assert, type IsExact } from "conditional-type-checks";
import { findCause, findCauseByType } from "../../src/index.js";

describe("index", () => {
  describe(findCause.name, () => {
    describe("with predicate", () => {
      it("should return undefined if there is no cause and the error does not match", () => {
        const err = new Error("root");
        const result = findCause(err, (e) => e !== err);
        expect(result).to.be.undefined;
      });
      it("should return undefined if there are causes but none match", () => {
        const leaf = new Error("leaf");
        const mid = new Error("trunk", { cause: leaf });
        const root = new Error("root", { cause: mid });
        const result = findCause(root, (e) => e === "not any error");
        expect(result).to.be.undefined;
      });
      it("should return the argument when there are no causes and it matches", () => {
        const root = new Error("root");
        const result = findCause(root, (e) => e === root);
        assert<IsExact<unknown | undefined, typeof result>>(true);
        expect(result).to.equal(root);
      });
      it("should return the first matching cause in the chain", () => {
        const leaf = new Error("leaf");
        const mid = new Error("trunk", { cause: leaf });
        const root = new Error("root", { cause: mid });
        const result = findCause(root, (e) => e === leaf);
        assert<IsExact<unknown | undefined, typeof result>>(true);
        expect(result).to.equal(leaf);
      });
    });
    describe("with type guard", () => {
      it("should infer the right type with a typeof operator", () => {
        const err = "root";
        const result = findCause(err, (e) => typeof e === "string");
        assert<IsExact<string | undefined, typeof result>>(true);
        expect(result).to.equal(err);
      });
      it("should infer the right type with an instanceof operator", () => {
        class CustomError extends Error {}
        const err = new CustomError("root");
        const result = findCause(
          err,
          (e): e is CustomError => e instanceof CustomError,
        );
        assert<IsExact<CustomError | undefined, typeof result>>(true);
        expect(result).to.equal(err);
      });
      it("should infer the right type with explicit type guard", () => {
        interface CustomError {
          code: number;
        }
        const isCustomError = (err: unknown): err is CustomError => {
          return isObjectNotNull(err) && "code" in err && isNumber(err.code);
        };
        const root = new Error("root", { cause: { code: 42 } });
        const result = findCause(root, isCustomError);
        assert<IsExact<CustomError | undefined, typeof result>>(true);
        expect(result).to.deep.equal({ code: 42 });
      });
    });
  });
  describe(findCauseByType.name, () => {
    it("should return undefined if no instances can be found in the causal chain", () => {
      const leaf = new Error("leaf");
      const mid = new TypeError("trunk", { cause: leaf });
      const root = new RangeError("root", { cause: mid });
      const result = findCauseByType(root, SyntaxError);
      assert<IsExact<SyntaxError | undefined, typeof result>>(true);
      expect(result).to.be.undefined;
    });
    it("should work with a regular constructor", () => {
      const leaf = new SyntaxError("that's not how you spell it mfka!");
      const mid = new TypeError("trunk", { cause: leaf });
      const root = new RangeError("root", { cause: mid });
      const result = findCauseByType(root, SyntaxError);
      assert<IsExact<SyntaxError | undefined, typeof result>>(true);
      expect(result).to.equal(leaf);
    });
    it("should work with an abstract constructor", () => {
      abstract class CustomError extends Error {}
      class SpecificError extends CustomError {}

      const leaf = new SpecificError("specific issue");
      const mid = new TypeError("trunk", { cause: leaf });
      const root = new RangeError("root", { cause: mid });
      const result = findCauseByType(root, CustomError);
      assert<IsExact<CustomError | undefined, typeof result>>(true);
      expect(result).to.equal(leaf);
    });
  });
});
