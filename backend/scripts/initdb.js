const bookshelf = require("../config/bookshelf");
const utils = require("../config/utils");
const {
  ROLES,
  PUBLIC_ROUTES,
  uploadPermissions,
  FRANCHISE,
} = require("./data");
const fs = require("fs");
const apiFolder = "../api";
let rolesAndPermissions = "";
(async () => {
  await init();
  console.log("\n");
  await addRolesAndPermissions();
  console.log("\n");
  await addPublicRoutes();
  console.log("\n");
  await addUploadRoutes();
  console.log("\n");
  //await addMasterTableData();
  console.log("\n");
  await changeNullValuesForDeletedAndActive();
  process.exit(0);
})();

async function changeNullValuesForDeletedAndActive() {}

async function addMasterTableData() {
  console.log("\n");
  await utils.asyncForEach(FRANCHISE, async (f) => {
    let franchise = null;
    const franchiseResponse = await bookshelf
      .model("franchise-master")
      .where({ franchise_name: f.franchise_name })
      .fetch();

    if (franchiseResponse) {
      franchise = franchiseResponse.id;
      console.log(`Skipping Franchise ${f.franchise_name} `);
    } else {
      await bookshelf
        .model("franchise-master")
        .forge({
          franchise_name: f.franchise_name,
        })
        .save()
        .then((res) => {
          let data = res.toJSON();
          franchise = data.id;
          console.log(`Added Franchise ${f.franchise_name} `);
        });
    }

    console.log("\n");
    await utils.asyncForEach(f.schooling, async (s) => {
      const schoolingResponse = await bookshelf
        .model("schooling")
        .where({ name: s })
        .fetch();

      if (schoolingResponse) {
        console.log(`Skipping schooling ${s} `);
      } else {
        await bookshelf
          .model("schooling")
          .forge({
            name: s,
          })
          .save()
          .then((res) => {
            console.log(`Added schooling ${s} `);
          });
      }
    });

    console.log("\n");
    await utils.asyncForEach(f.marital_status, async (s) => {
      const maritalStatusResponse = await bookshelf
        .model("marital-status")
        .where({ name: s })
        .fetch();

      if (maritalStatusResponse) {
        console.log(`Skipping Marital Status ${s} `);
      } else {
        await bookshelf
          .model("marital-status")
          .forge({
            name: s,
          })
          .save()
          .then((res) => {
            console.log(`Added Marital Status ${s} `);
          });
      }
    });

    //muscleGroup
    console.log("\n");
    await utils.asyncForEach(f.muscleNames, async (s) => {
      const muscleNamesResponse = await bookshelf
        .model("muscle-group")
        .where({ name: s })
        .fetch();

      if (muscleNamesResponse) {
        console.log(`Skipping muscleName ${s} `);
      } else {
        await bookshelf
          .model("muscle-group")
          .forge({
            name: s,
          })
          .save()
          .then((res) => {
            console.log(`Added muscleName ${s} `);
          });
      }
    });

    console.log("\n");
    await utils.asyncForEach(f.countries, async (c) => {
      const countryResponse = await bookshelf
        .model("country")
        .where({ name: c })
        .fetch();

      if (countryResponse) {
        console.log(`Skipping country ${c} `);
      } else {
        await bookshelf
          .model("country")
          .forge({
            name: c,
          })
          .save()
          .then((res) => {
            console.log(`Added country ${c} `);
          });
      }
    });

    console.log("\n");
    await utils.asyncForEach(f.gender, async (g) => {
      const genderResponse = await bookshelf
        .model("gender")
        .where({ name: g })
        .fetch();

      if (genderResponse) {
        console.log(`Skipping gender ${g} `);
      } else {
        await bookshelf
          .model("gender")
          .forge({
            name: g,
          })
          .save()
          .then((res) => {
            console.log(`Added gender ${g} `);
          });
      }
    });

    console.log("\n");
    await utils.asyncForEach(f.relation, async (r) => {
      const relationResponse = await bookshelf
        .model("relation")
        .where({ name: r })
        .fetch();

      if (relationResponse) {
        console.log(`Skipping relation ${r} `);
      } else {
        await bookshelf
          .model("relation")
          .forge({
            name: r,
          })
          .save()
          .then((res) => {
            console.log(`Added relation ${r} `);
          });
      }
    });

    console.log("\n");
    await utils.asyncForEach(f.userTags, async (u) => {
      const userTagsResponse = await bookshelf
        .model("user-tags")
        .where({ name: u })
        .fetch();

      if (userTagsResponse) {
        console.log(`Skipping userTags ${u} `);
      } else {
        await bookshelf
          .model("user-tags")
          .forge({
            name: u,
          })
          .save()
          .then((res) => {
            console.log(`Added userTags ${u} `);
          });
      }
    });

    console.log("\n");
    await utils.asyncForEach(f.sizeWeight, async (s) => {
      const sizeWeightResponse = await bookshelf
        .model("size-weight")
        .where({ name: s })
        .fetch();

      if (sizeWeightResponse) {
        console.log(`Skipping sizeWeight ${s} `);
      } else {
        await bookshelf
          .model("size-weight")
          .forge({
            name: s,
          })
          .save()
          .then((res) => {
            console.log(`Added sizeWeight ${s} `);
          });
      }
    });

    console.log("\n");
    await utils.asyncForEach(f.userTags, async (u) => {
      const userTagsResponse = await bookshelf
        .model("user-tags")
        .where({ name: u })
        .fetch();

      if (userTagsResponse) {
        console.log(`Skipping userTags ${u} `);
      } else {
        await bookshelf
          .model("user-tags")
          .forge({
            name: u,
          })
          .save()
          .then((res) => {
            console.log(`Added userTags ${u} `);
          });
      }
    });
  });
}

async function init() {
  // Project specific models APIs, controllers and action
  let apiControllerActions = fs
    .readdirSync(apiFolder, { withFileTypes: true })
    .filter((api) => {
      return api.isDirectory();
    })
    .reduce((acc, folder) => {
      const { name } = folder;
      const raw = fs.readFileSync(`../api/${name}/config/routes.json`);
      const route = JSON.parse(raw);
      const actionObj = route.routes.reduce((result, r) => {
        const action = r.handler.split(".")[1].toLowerCase();
        result[action] = { enabled: false };
        return result;
      }, {});
      console.log("accccc", acc[name], actionObj);
      acc[name] = actionObj;
      return acc;
    }, {});

  apiControllerActions = Object.assign(apiControllerActions, {
    auth: {
      find: { enabled: false },
      count: { enabled: false },
      findone: { enabled: false },
      create: { enabled: false },
      update: { enabled: false },
      destroy: { enabled: false },
      me: { enabled: false },
      getalladmins: { enabled: true },
      getallstaff: { enabled: true },
    },
    user: {
      find: { enabled: false },
      count: { enabled: false },
      findone: { enabled: false },
      create: { enabled: false },
      update: { enabled: false },
      destroy: { enabled: false },
      me: { enabled: false },
    },
    userspermissions: {
      createrole: { enabled: false },
      deleterole: { enabled: false },
      getadvancedsettings: { enabled: false },
      getemailtemplate: { enabled: false },
      getpermissions: { enabled: false },
      getpolicies: { enabled: false },
      getproviders: { enabled: false },
      getrole: { enabled: false },
      getroutes: { enabled: false },
      index: { enabled: false },
      searchusers: { enabled: false },
      updateadvancedsettings: { enabled: false },
      updateemailtemplate: { enabled: false },
      updateproviders: { enabled: false },
      updaterole: { enabled: false },
      getroles: { enabled: false },
    },
  });

  let allAPIsControllerActions = Object.assign({}, apiControllerActions);

  allAPIsControllerActions = Object.assign(apiControllerActions);
  rolesAndPermissions = Object.keys(ROLES).map((r) => {
    const { controllers, grantAllPermissions } = ROLES[r];
    const updatedController = controllers.reduce((result, controller) => {
      const { name, action, type } = controller;

      const controllerType = type ? type : "application";

      result[controllerType] = result[controllerType] || {
        controllers: {},
      };

      if (grantAllPermissions) {
        const controllerWithAction = allAPIsControllerActions[name];
        const updatedActions = Object.keys(controllerWithAction).reduce(
          (acc, a) => {
            acc[a] = { enabled: true };
            return acc;
          },
          {}
        );
        result[controllerType]["controllers"][name] = updatedActions;
      } else {
        const controllerWithAction = allAPIsControllerActions[name];
        let updatedActions;
        if (action.length) {
          const regex = new RegExp(action.join("|"), "i");
          updatedActions = Object.keys(controllerWithAction).reduce(
            (acc, a) => {
              acc[a] = { enabled: regex.test(a) };
              return acc;
            },
            {}
          );
        } else {
          updatedActions = Object.keys(controllerWithAction).reduce(
            (acc, a) => {
              acc[a] = { enabled: false };
              return acc;
            },
            {}
          );
        }
        result[controllerType]["controllers"][name] = updatedActions;
      }
      return result;
    }, {});

    return {
      name: r,
      description: r,
      permissions: updatedController,
    };
  });
}

async function addRolesAndPermissions() {
  await utils.asyncForEach(rolesAndPermissions, async (role) => {
    const response = await bookshelf
      .model("role")
      .fetchAll()
      .then((model) => model.toJSON());

    if (response.length) {
      const isRolePresent = response.find((r) => r.name === role.name);
      if (isRolePresent) {
        bookshelf
          .model("permission")
          .where({ role: isRolePresent.id })
          .destroy()
          .then(() => {
            console.log(
              `Deleting existing permissions for role ${isRolePresent.name}\nAdding new permissions\n`
            );
            addPermissionsToGivenRole(role, isRolePresent.id);
          });
      } else {
        // Creating role
        await bookshelf
          .model("role")
          .forge({
            name: role.name,
            description: role.description,
            type: role.name,
          })
          .save()
          .then((r) => {
            const _role = r.toJSON();
            addPermissionsToGivenRole(role, _role.id);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  });
}

async function addPermissionsToGivenRole(role, id) {
  /**
   * Creating permissions WRT to controllers and mapping to created role
   */
  await utils.asyncForEach(
    Object.keys(role.permissions || {}),
    async (type) => {
      await utils.asyncForEach(
        Object.keys(role.permissions[type].controllers),
        async (controller) => {
          console.log(
            `Adding permission for ${controller} for role ${role.name}`
          );

          await utils.asyncForEach(
            Object.keys(role.permissions[type].controllers[controller]),
            (action) => {
              bookshelf
                .model("permission")
                .forge({
                  role: id,
                  type: controller === "user" ? "users-permissions" : type,
                  controller: controller,
                  action: action.toLowerCase(),
                  ...role.permissions[type].controllers[controller][action],
                })
                .save();
            }
          );
        }
      );
    }
  );
}

async function getPublicRole() {
  return await bookshelf
    .model("role")
    .where({ name: "Public" })
    .fetch()
    .then((res) => res.toJSON());
}

async function deleteAllPublicRoute(role) {
  await bookshelf
    .model("permission")
    .where({
      role: role.id,
      type: "application",
    })
    .destroy({ require: false })
    .then(() => {
      console.log("\nDeleting all public routes...");
    });
}

async function addUploadRoutes() {
  const userDefinedRoles = Object.keys(ROLES);
  const roles = await bookshelf
    .model("role")
    .where("name", "in", userDefinedRoles)
    .fetchAll()
    .then((res) => res.toJSON());

  await utils.asyncForEach(uploadPermissions, async (action) => {
    await utils.asyncForEach(roles, async (role) => {
      const permission = await bookshelf
        .model("permission")
        .where({
          type: "upload",
          controller: "upload",
          action: action,
          role: role.id,
        })
        .fetch({
          require: false,
        });

      if (!permission) {
        await bookshelf
          .model("permission")
          .forge({
            type: "upload",
            controller: "upload",
            action: action,
            enabled: true,
            role: role.id,
          })
          .save()
          .then(() => {
            console.log(`${action} added for role ${role.name}`);
          });
      } else {
        console.log(`Skipping ${action} for role ${role.name}`);
      }
    });
  });
}

async function addPublicRoutes() {
  const role = await getPublicRole();
  await deleteAllPublicRoute(role);

  const publicApplicationRoutes = PUBLIC_ROUTES.controllers.filter(
    (controller) => !controller.type
  );
  const publicUserPermissionRoutes = PUBLIC_ROUTES.controllers.filter(
    (controller) => controller.type === "users-permissions"
  );
  await utils.asyncForEach(publicApplicationRoutes, async (controller) => {
    const { action, name } = controller;
    await utils.asyncForEach(action, async (act) => {
      await bookshelf
        .model("permission")
        .forge({
          role: role.id,
          type: "application",
          controller: name,
          action: act,
          enabled: true,
        })
        .save()
        .then(() => {
          console.log(`Added ${act} to controller ${name}`);
        });
    });
  });

  await utils.asyncForEach(publicUserPermissionRoutes, async (controller) => {
    const { action, name } = controller;

    await bookshelf
      .model("permission")
      .where({
        role: role.id,
        type: "users-permissions",
        controller: name,
      })
      .destroy({ require: false })
      .then(() => {
        console.log(`\nDeleting all public routes for ${name}...`);
      });

    await utils.asyncForEach(action, async (act) => {
      await bookshelf
        .model("permission")
        .forge({
          role: role.id,
          type: "users-permissions",
          controller: name,
          action: act,
          enabled: true,
        })
        .save()
        .then(() => {
          console.log(`Added ${act} to controller ${name}`);
        });
    });
  });
}
