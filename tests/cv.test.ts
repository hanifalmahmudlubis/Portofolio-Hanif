import test from "node:test";
import assert from "node:assert/strict";
import { cvContentInput, bulletInput } from "../src/lib/cv-validation";
import {
  CV_LIMITS,
  compactCvText,
  projectCvPoints,
  experienceCvPoints,
} from "../src/lib/cv-config";
import { buildSkillGroups } from "../src/lib/skills";
import { ApiError } from "../src/lib/api/error";
import { cvFixture } from "./cv-fixture";

test("CV content validates dates, private contact fields, selections, and duplicate skills", () => {
  const original = cvFixture();
  const parsed = cvContentInput({
    ...original,
    education: [
      ...original.education,
      {
        ...original.education[0],
        id: "recent",
        startDate: "2025-01",
        endDate: null,
      },
    ],
  });
  assert.equal(parsed.education[0].id, "recent");
  const legacy = cvContentInput({
    ...original,
    preferences: { ...original.preferences, breakBeforeProjects: true },
  });
  assert.equal("breakBeforeProjects" in legacy.preferences, false);
  for (const patch of [
    { profile: { ...original.profile, email: "invalid" } },
    {
      profile: {
        ...original.profile,
        summary: "x".repeat(CV_LIMITS.summary + 1),
      },
    },
    { profile: { ...original.profile, githubUrl: "javascript:alert(1)" } },
    { education: [{ ...original.education[0], endDate: "2010-01" }] },
    { preferences: { ...original.preferences, includePhoto: "yes" } },
    {
      skillGroups: [
        ...original.skillGroups,
        { key: "tools", skills: ["REACT"] },
      ],
    },
    { languages: [{ name: "", proficiency: "Native" }] },
  ])
    assert.throws(() => cvContentInput({ ...original, ...patch }), ApiError);
});

test("CV copy stays concise without changing the original website description", () => {
  assert.throws(
    () =>
      bulletInput(["x".repeat(CV_LIMITS.pointCharacters + 1)], "cvHighlights"),
    ApiError,
  );
  assert.throws(
    () => bulletInput(["a", "b", "c", "d"], "cvHighlights"),
    ApiError,
  );
  assert.deepEqual(
    bulletInput(["One concise responsibility"], "responsibilities"),
    ["One concise responsibility"],
  );
  assert.throws(
    () => bulletInput(["a", "b", "c", "d"], "responsibilities"),
    ApiError,
  );
  const original =
    "A detailed project description that remains intact on the website. ".repeat(
      10,
    );
  const concise = compactCvText(original, 220);
  assert.ok(concise.length <= 220);
  assert.ok(concise.endsWith("."));
  assert.ok(
    compactCvText(
      "An extended sentence with many words ".repeat(20),
      220,
    ).endsWith("…"),
  );
  assert.equal(compactCvText("Short description", 220), "Short description");
});

test("automatic CV points use full project details and action clauses without fabricating extra claims", () => {
  const points = projectCvPoints({
    shortDescription: "A brief overview.",
    fullDescription:
      "Developed the application for clinic operations. Organized patient records.",
    solution:
      "Integrated the application with internal APIs. Implemented the approval workflow.",
  });
  assert.deepEqual(points, [
    "Developed the application for clinic operations.",
    "Integrated the application with internal APIs.",
    "Implemented the approval workflow.",
  ]);
  const experience = experienceCvPoints(
    "Assisted network troubleshooting, performed network speed testing, supported monitoring, and participated in an automation project.",
  );
  assert.equal(experience.length, 3);
  assert.ok(experience[2].includes("Supported monitoring"));
  assert.ok(experience[2].includes("Participated in an automation project."));
  assert.deepEqual(
    experienceCvPoints(
      "Developed interfaces using HTML, CSS, JavaScript, and Laravel. Performed debugging and optimization.",
    ),
    [
      "Developed interfaces using HTML, CSS, JavaScript, and Laravel.",
      "Performed debugging and optimization.",
    ],
  );
  assert.deepEqual(experienceCvPoints("Maintained the database."), [
    "Maintained the database.",
  ]);
  assert.deepEqual(
    experienceCvPoints(
      "Contributed to application development. Additionally, participated in authentication integration.",
    ),
    [
      "Contributed to application development.",
      "Participated in authentication integration.",
    ],
  );
  const coordinated = projectCvPoints({
    shortDescription: "",
    fullDescription: "Contributed to the mobile application.",
    solution:
      "Developed and integrated permission features using internal APIs. Implemented request history and approval workflows.",
  });
  assert.deepEqual(coordinated, [
    "Contributed to the mobile application.",
    "Developed and integrated permission features using internal APIs.",
    "Implemented request history and approval workflows.",
  ]);
  assert.deepEqual(
    experienceCvPoints(
      "Developed and integrated application features. Also, performed debugging.",
    ),
    ["Developed and integrated application features.", "Performed debugging."],
  );
  assert.ok(
    projectCvPoints({
      shortDescription: "",
      fullDescription: "Built " + "reliable features ".repeat(40),
      solution: null,
    }).every((point) => point.length <= CV_LIMITS.pointCharacters),
  );
});

test("shared skills honor grouping and visibility without losing project technologies", () => {
  const groups = buildSkillGroups([
    { name: "Hidden", category: "Tools", showInSkills: false },
    { name: "React", category: "Framework", skillOrder: 2 },
    { name: "HTML", category: "Frontend", skillOrder: 0 },
    { name: "Custom", category: "Framework", skillGroup: "network" },
  ]);
  assert.deepEqual(groups[0].skills, ["HTML", "React"]);
  assert.deepEqual(groups[4].skills, ["Custom"]);
  assert.equal(
    groups.flatMap((group) => group.skills).includes("Hidden"),
    false,
  );
});
