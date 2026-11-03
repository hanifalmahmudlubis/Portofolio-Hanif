"use client";
import { Search } from "lucide-react";
import { useState } from "react";
import type { Project } from "@/types/project";
import ProjectCard from "./ProjectCard";
export default function ProjectGrid({
  projects,
  searchable = false,
}: {
  projects: Project[];
  searchable?: boolean;
}) {
  const [category, setCategory] = useState("All projects");
  const [query, setQuery] = useState("");
  const categories = [
    "All projects",
    ...new Set(projects.map((project) => project.category)),
  ];
  const filtered = projects.filter(
    (project) =>
      (category === "All projects" || project.category === category) &&
      `${project.title} ${project.shortDescription} ${project.technologies.map((item) => item.technology.name).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div>
      <div className="project-toolbar">
        <div className="project-filters" aria-label="Filter projects">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className="project-filter"
            >
              {item}
            </button>
          ))}
        </div>
        {searchable && (
          <label className="relative min-w-[220px]">
            <Search
              size={15}
              className="absolute left-3 top-3.5 text-[#8997ae]"
            />
            <input
              className="input !pl-9"
              aria-label="Search projects"
              placeholder="Search projects or technologies…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {filtered.length} projects found
      </p>
      {filtered.length ? (
        <div className="project-grid">
          {filtered.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No projects found.</p>
          {(query || category !== "All projects") && (
            <button
              className="mt-4 text-sm text-[#91a6df]"
              onClick={() => {
                setQuery("");
                setCategory("All projects");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
