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
      <div className="mb-9 flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap gap-2" aria-label="Filter projects">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={`rounded-md border px-3 py-2 text-xs transition-colors ${category === item ? "border-[#37568d] bg-[#91a6df]/10 text-[#a6bfff]" : "border-[#263146] text-[#9ba6ba] hover:border-[#9ba6ba]"}`}
            >
              {item}
              {item === "All projects" && (
                <span className="ml-2 opacity-60">
                  {projects.length.toString().padStart(2, "0")}
                </span>
              )}
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
        <div className="grid gap-6 md:grid-cols-2">
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
