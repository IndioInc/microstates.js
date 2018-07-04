import { expect } from 'chai';

import { create } from '../src/picostates';

describe('initialization', () => {
  describe('at root', () => {
    class Session {
      initialize(data = { token: null }) {
        if (data.token) {
          return create(Authenticated, data);
        }
        return create(Anonymous, data);
      }
    }
    class Authenticated extends Session {
      token = create(class StringType {});
      logout() {}
    }
    class Anonymous extends Session {
      signin() {}
    }

    describe('initialize without token', () => {
      let initialized;
      beforeEach(() => {
        initialized = create(Session);
      });

      it('initilizes into another type', () => {
        expect(initialized).to.be.instanceof(Anonymous);
      });

      it('has signin transition', () => {
        expect(initialized.signin).to.be.instanceof(Function);
      });

      describe('calling initialize on initialized microstate', () => {
        let reinitialized;
        beforeEach(() => {
          reinitialized = initialized.initialize({ token: 'foo' });
        });

        it('initilizes into Authenticated', () => {
          expect(reinitialized).to.be.instanceof(Authenticated);
          expect(reinitialized.state).to.deep.equal({ token: 'foo' });
        });
      });
    });

    describe('initialize with token', () => {
      let initialized;
      beforeEach(() => {
        initialized = create(Session, { token: 'SECRET' });
      });

      it('initilizes into Authenticated', () => {
        expect(initialized).to.be.instanceof(Authenticated);
        expect(initialized.state).to.deep.equal({ token: 'SECRET' });
      });

      it('has signin transition', () => {
        expect(initialized.logout).to.be.instanceof(Function);
      });
    });
  });

  describe("deeply nested", () => {
    class Root {
      first = create(class First {
        second = create(class Second {
          name = create(class StringType {
            concat(value) {
              return String(this.state).concat(String(value));
            }
          });
          initialize(props) {
            if (!props) {
              return create(Second, { name: "default" });
            }
            return this;
          }
        });
      });
    }

    describe('initialization', () => {
      let root;

      beforeEach(() => {
        root = create(Root, { first: { } });
      });

      it("has result of create of second node", () => {
        expect(root.state).to.deep.equal({
          first: {
            second: {
              name: "default",
            },
          },
        });
      });

      describe('transition', () => {

        let changed;
        beforeEach(() => {

          changed = root.first.second.name.concat("!!!");
        });

        it("has result after transition valueOf", () => {
          expect(changed.state).to.deep.equal({
            first: {
              second: {
                name: "default!!!",
              },
            },
          });
        });

      });
    });
  });
})

import { Meta } from '../src/picostates'
