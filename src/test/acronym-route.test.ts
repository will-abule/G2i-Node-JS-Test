import { port, server } from "../index";
import express from "express";
import { Acronym } from "../models/acronym-model";
import { mongoDBConnect } from "../startup/db";
import request from "supertest";
import { populateDB } from "../utils/functions/populate-db-functions";

const app = express();

const updateContent = { definition: "You crack me up 2" };

describe("/acronym", () => {
  beforeAll(async () => {
    await mongoDBConnect.connect(app);
  });

  afterAll(async () => {
    await mongoDBConnect.disconnect();
    jest.clearAllTimers();
  });

  beforeEach(async () => {
    jest.setTimeout(20000);
    if (!server.listening) {
      server.listen(port, () =>
        console.info(`TEST - listening on port ${port}`)
      );
    }
  });

  afterEach(async () => {
    if (server.listening) {
      server.close();
    }
  });

  describe("GET /acronym", () => {
    it("should get the list of acronym return 200", async () => {
      await populateDB();
      const res = await request(server).get("/acronym").query({
        limit: 10,
        from: 2,
        search: "welcome",
      });

      expect(res.status).toBe(200);
      await Acronym.deleteMany();
    });

    it("should return 400 no 'limit' query params when getting the list of acronym", async () => {
      const res = await request(server).get("/acronym").query({
        from: 2,
        search: "welcome",
      });

      expect(res.status).toBe(400);
      expect(res.text).toBe(
        `No 'limit' was Found! please add a limit to the query params its required`
      );
    });

    it("should return 400 no 'from' query params when getting the list of acronym", async () => {
      const res = await request(server).get("/acronym").query({
        limit: 10,
        search: "welcome",
      });
      expect(res.status).toBe(400);
      expect(res.text).toBe(
        `No 'from' was Found! please add a from to the query params its required`
      );
    });

    it("should return 400 no 'search' query params when getting the list of acronym", async () => {
      const res = await request(server).get("/acronym").query({
        limit: 10,
        from: 2,
      });
      expect(res.status).toBe(400);
      expect(res.text).toBe(
        `No 'search' was Found! please add a search to the query params its required`
      );
    });
  });

  describe("GET /:acronym", () => {
    it("should get a role return 200", async () => {
      const acronym = new Acronym({
        acronym: "?4U",
        definition: "You crack me up 2",
      });

      await acronym.save();
      const res = await request(server).get(`/acronym/?4U`);

      expect(res.status).toBe(200);
      await Acronym.deleteMany();
    });

    it("should return 404 if user not found", async () => {
      const res = await request(server).get(
        `/acronym/5be6b846556caf5ce406c646`
      );
      expect(res.status).toBe(404);
      expect(res.text).toBe(
        `No Acronym with this '5be6b846556caf5ce406c646' was Found! please make sure you're sending the correct id`
      );
    });

    it("should return 404 if user not found", async () => {
      const res = await request(server).get(`/acronym/qwerty`);
      expect(res.status).toBe(404);
      expect(res.text).toBe(
        `No Acronym with this 'qwerty' was Found! please make sure you're sending the correct acronym`
      );
    });
  });

  describe("POST /", () => {
    it("should return 200 registration is valid", async () => {
      const res = await request(server).post(`/acronym/`).send({
        acronym: "BRB",
        definition: "Be right back",
      });

      expect(res.status).toBe(200);
      expect(res.body.acronym).toBe("BRB");
      expect(res.body.definition).toBe("Be right back");
    });

    it("should return 400 registration is valid", async () => {
      const res = await request(server).post(`/acronym/`).send({});

      expect(res.status).toBe(400);
      expect(res.text).toBe("request body not provide!");
    });

    it("should return 400 registration is valid", async () => {
      const res = await request(server).post(`/acronym/`).send({
        acronym: "BRB5",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /:acronym", () => {
    it("should return 200 acronym update is valid", async () => {
      const acronym = new Acronym({
        acronym: "1337",
        definition: "You crack me up 2",
      });

      await acronym.save();

      const res = await request(server)
        .put(`/acronym/1337`)
        .set("x-auth-token", "authorized user")
        .send(updateContent);

      expect(res.status).toBe(200);
      expect(res.body.definition).toBe("You crack me up 2");
      await Acronym.deleteMany();
    });

    it("should return 400 if empty body", async () => {
      const res = await request(server)
        .put(`/acronym/5be6b846556caf5ce406c646`)
        .set("x-auth-token", "authorized user")
        .send({});

      expect(res.status).toBe(400);
      expect(res.text).toBe("request body not provide!");
    });

    it("should return 404 acronym not found", async () => {
      const res = await request(server)
        .put(`/acronym/5be6b846556caf5ce406c646`)
        .set("x-auth-token", "authorized user")
        .send(updateContent);

      expect(res.status).toBe(404);
      expect(res.text).toBe(
        `No Acronym with this '5be6b846556caf5ce406c646' was Found! please make sure you're sending the correct id`
      );
    });

    it("should return 400 acronym, There're more than one Acronym", async () => {
      for (let i = 0; i < 2; i++) {
        const acronym = new Acronym({
          acronym: "BB",
          definition: "Back Black",
        });

        await acronym.save();
      }

      const res = await request(server)
        .put(`/acronym/BB`)
        .set("x-auth-token", "authorized user")
        .send(updateContent);

      expect(res.status).toBe(400);
      expect(JSON.parse(res.text).message).toBe(
        `There're more than one Acronym with this acronym 'BB', check the data response of this request to check and use the _id of the acronym instead of the acronym 'BB'`
      );
      await Acronym.deleteMany();
    });
  });

  describe("DELETE /:acronymId", () => {
    it("should delete the a acronym return 200", async () => {
      const acronym = new Acronym({
        acronym: "CRE8",
        definition: "Create",
      });

      await acronym.save();

      const res = await request(server)
        .delete(`/acronym/CRE8`)
        .set("x-auth-token", "authorized user");

      expect(res.status).toBe(200);
      expect(res.body.definition).toBe("Create");
      await Acronym.deleteMany();
    });

    it("should return 401 if the user is not authorized", async () => {
      const res = await request(server).delete(
        `/acronym/5be6b846556caf5ce406c646`
      );

      expect(res.status).toBe(401);
      expect(res.text).toBe("Access denied, please provide a valid token");
    });

    it("should return 404 if acronym not found", async () => {
      const res = await request(server)
        .delete(`/acronym/5be6b846556caf5ce406c646`)
        .set("x-auth-token", "authorized user");

      expect(res.status).toBe(404);
      expect(res.text).toBe(
        `No Acronym with this '5be6b846556caf5ce406c646' was Found! please make sure you're sending the correct id`
      );
    });
    it("should return 400 if acronym, There're more than one Acronym", async () => {
      for (let i = 0; i < 2; i++) {
        const acronym = new Acronym({
          acronym: "BB",
          definition: "Back Black",
        });

        await acronym.save();
      }

      const res = await request(server)
        .delete(`/acronym/BB`)
        .set("x-auth-token", "authorized user");

      expect(res.status).toBe(400);
      expect(JSON.parse(res.text).message).toBe(
        "There're more than one Acronym with this acronym 'BB', check the data response of this request to check and use the _id of the acronym instead of the acronym 'BB'"
      );
      await Acronym.deleteMany();
    });

    it("should return 404 if acronym not found", async () => {
      const res = await request(server)
        .delete(`/acronym/???poiuytdfghjk`)
        .set("x-auth-token", "authorized user");

      expect(res.status).toBe(404);
      expect(res.text).toBe(
        `No Acronym with this '???poiuytdfghjk' was Found! please make sure you're sending the correct acronym`
      );
    });
  });
});
