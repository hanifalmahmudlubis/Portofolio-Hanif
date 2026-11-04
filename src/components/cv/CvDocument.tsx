import {
  Document,
  Page,
  Text,
  View,
  Link,
  Image as PdfImage,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { CvDocumentData } from "../../types/cv";
import { formatMonth } from "../../lib/site";

const contentWidth = 595.28 - 56;
Font.registerHyphenationCallback((word) => [word]);
const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingHorizontal: 28,
    paddingBottom: 28,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.2,
    color: "#111111",
  },
  header: { position: "relative", justifyContent: "center", marginBottom: 2 },
  headerWithPhoto: { minHeight: 90 },
  headerText: { width: "100%", textAlign: "center" },
  headerTextWithPhoto: { paddingHorizontal: 82 },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    marginBottom: 4,
    textAlign: "center",
  },
  contact: {
    fontSize: 9.5,
    color: "#666666",
    marginBottom: 2,
    textAlign: "center",
  },
  link: { fontSize: 9.5, color: "#1753a6", textDecoration: "underline" },
  headerLinks: { textAlign: "center" },
  photo: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 70,
    height: 90,
    objectFit: "cover",
  },
  section: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    textAlign: "center",
    borderBottomWidth: 0.8,
    borderBottomColor: "#111111",
    paddingBottom: 4,
    marginTop: 12,
    marginBottom: 6,
  },
  summary: { textAlign: "justify" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  heading: { width: contentWidth - 123, fontFamily: "Helvetica-Bold" },
  muted: { fontFamily: "Helvetica", color: "#777777" },
  date: { width: 113, flexShrink: 0, textAlign: "right", fontSize: 10 },
  italic: { fontFamily: "Helvetica-Oblique", marginTop: 1, marginBottom: 3 },
  item: { marginBottom: 6 },
  bullet: { flexDirection: "row", paddingLeft: 3, marginBottom: 1 },
  bulletDot: { width: 12, flexShrink: 0 },
  bulletText: { width: contentWidth - 15 },
  tech: { fontSize: 10, color: "#666666", marginTop: 1, marginBottom: 3 },
  skill: { marginBottom: 4 },
  bold: { fontFamily: "Helvetica-Bold" },
});
function Section({ children }: { children: string }) {
  return (
    <Text style={styles.section} minPresenceAhead={28}>
      {children}
    </Text>
  );
}
function Bullets({ items }: { items: string[] }) {
  return items.map((item, index) => (
    <View key={index} style={styles.bullet}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText} orphans={2} widows={2}>
        {item}
      </Text>
    </View>
  ));
}
function period(start: string, end: string | null) {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}
const visibleUrl = (value: string) => {
  const url = new URL(value);
  return `${url.host}${url.pathname}`.replace(/\/$/, "");
};
const groupTitles: Record<string, string> = {
  web: "Programming & Web",
  mobile: "Mobile",
  databases: "Database",
  machine: "Machine Learning",
  network: "Networking & Automation",
  tools: "Tools",
  other: "Other Technologies",
};

export default function CvDocument({
  data,
  onPageCount,
}: {
  data: CvDocumentData;
  onPageCount?: (pages: number) => void;
}) {
  const {
    profile,
    education,
    projects,
    experiences,
    certificates,
    skillGroups,
    softSkills,
    languages,
    preferences,
  } = data;
  const hasPhoto = Boolean(preferences.includePhoto && data.photo);
  return (
    <Document
      title={`${profile.fullName} — CV`}
      author={profile.fullName}
      language="en"
      subject="Curriculum Vitae"
    >
      <Page size="A4" wrap style={styles.page}>
        <View
          style={[styles.header, hasPhoto ? styles.headerWithPhoto : {}]}
          wrap={false}
        >
          {hasPhoto && <PdfImage src={data.photo} style={styles.photo} />}
          <View
            style={[
              styles.headerText,
              hasPhoto ? styles.headerTextWithPhoto : {},
            ]}
          >
            <Text style={styles.name}>{profile.fullName.toUpperCase()}</Text>
            <Text style={styles.contact}>
              <Link
                src={`mailto:${profile.email}`}
                style={{ color: "#666666", textDecoration: "none" }}
              >
                {profile.email}
              </Link>
              {profile.phone ? (
                <>
                  {" "}
                  |{" "}
                  <Link
                    src={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}
                    style={{ color: "#666666", textDecoration: "none" }}
                  >
                    {profile.phone}
                  </Link>
                </>
              ) : (
                ""
              )}
              {profile.location ? ` | ${profile.location}` : ""}
            </Text>
            {(profile.linkedinUrl || profile.githubUrl) && (
              <Text style={styles.headerLinks}>
                {profile.linkedinUrl && (
                  <Link src={profile.linkedinUrl} style={styles.link}>
                    {visibleUrl(profile.linkedinUrl)}
                  </Link>
                )}
                {profile.linkedinUrl && profile.githubUrl ? " | " : ""}
                {profile.githubUrl && (
                  <Link src={profile.githubUrl} style={styles.link}>
                    {visibleUrl(profile.githubUrl)}
                  </Link>
                )}
              </Text>
            )}
            {profile.portfolioUrl && (
              <Text style={styles.headerLinks}>
                <Link src={profile.portfolioUrl} style={styles.link}>
                  {visibleUrl(profile.portfolioUrl)}
                </Link>
              </Text>
            )}
          </View>
        </View>
        <Section>PROFIL</Section>
        <Text style={styles.summary} orphans={2} widows={2}>
          {profile.summary}
        </Text>
        {!!education.length && (
          <>
            <Section>EDUCATION</Section>
            {education.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.row} wrap={false} minPresenceAhead={25}>
                  <Text style={styles.heading}>
                    {item.institution}
                    {item.location && (
                      <Text style={styles.muted}> – {item.location}</Text>
                    )}
                  </Text>
                  <Text style={styles.date}>
                    {period(item.startDate, item.endDate)}
                  </Text>
                </View>
                <Text style={styles.italic}>
                  {item.degree}
                  {item.major &&
                  !item.degree.toLowerCase().includes(item.major.toLowerCase())
                    ? `, ${item.major}`
                    : ""}
                </Text>
                {item.gpa && <Text>GPA {item.gpa}</Text>}
              </View>
            ))}
          </>
        )}
        {!!experiences.length && (
          <>
            <Section>EXPERIENCES</Section>
            {experiences.map((item) => (
              <View key={item.id} style={styles.item}>
                <View wrap={false} minPresenceAhead={23}>
                  <View style={styles.row}>
                    <Text style={styles.heading}>
                      {item.company}
                      {item.location && (
                        <Text style={styles.muted}> – {item.location}</Text>
                      )}
                    </Text>
                    <Text style={styles.date}>
                      {period(item.startDate, item.endDate)}
                    </Text>
                  </View>
                  <Text style={styles.italic}>
                    {item.position}
                    {item.employmentType ? `, ${item.employmentType}` : ""}
                  </Text>
                </View>
                <Bullets items={item.responsibilities} />
              </View>
            ))}
          </>
        )}
        {!!projects.length && (
          <>
            <Section>PROJECTS</Section>
            {projects.map((item) => (
              <View key={item.id} style={styles.item}>
                <View wrap={false} minPresenceAhead={23}>
                  <View style={styles.row}>
                    <Text style={styles.heading}>{item.title}</Text>
                    <Text style={styles.date}>{item.year}</Text>
                  </View>
                  <Text style={styles.tech}>
                    {[item.projectType, item.technologies.join(", ")]
                      .filter(Boolean)
                      .join(" | ")}
                  </Text>
                </View>
                <Bullets items={item.highlights} />
                {item.liveDemoUrl && (
                  <Link src={item.liveDemoUrl} style={styles.link}>
                    Live demo
                  </Link>
                )}
              </View>
            ))}
          </>
        )}
        {!!certificates.length && (
          <>
            <Section>CERTIFICATE</Section>
            {certificates.map((item) => (
              <View key={item.id} style={styles.row} wrap={false}>
                <Text style={styles.heading}>
                  {item.credentialUrl ? (
                    <Link
                      src={item.credentialUrl}
                      style={{ color: "#111111", textDecoration: "none" }}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                  <Text style={styles.muted}> – {item.issuer}</Text>
                </Text>
                <Text style={styles.date}>
                  {item.issueDate ? formatMonth(item.issueDate) : item.year}
                </Text>
              </View>
            ))}
          </>
        )}
        {(skillGroups.some((group) => group.skills.length) ||
          softSkills.length > 0 ||
          languages.length > 0) && (
          <>
            <Section>SKILLS</Section>
            {skillGroups.some((group) => group.skills.length) && (
              <Text style={styles.bold} minPresenceAhead={20}>
                Hard Skills:
              </Text>
            )}
            {skillGroups
              .filter((group) => group.skills.length)
              .map((group) => (
                <Text
                  key={group.key}
                  style={styles.skill}
                  orphans={2}
                  widows={2}
                >
                  • {groupTitles[group.key] || group.title}:{" "}
                  {group.skills.join(", ")}
                </Text>
              ))}
            {!!softSkills.length && (
              <Text style={styles.skill}>
                <Text style={styles.bold}>Soft Skills: </Text>
                {softSkills.join(", ")}
              </Text>
            )}
            {!!languages.length && (
              <>
                <Text style={styles.bold} minPresenceAhead={20}>
                  Language:
                </Text>
                <Bullets
                  items={languages.map(
                    (item) => `${item.name}: ${item.proficiency}`,
                  )}
                />
              </>
            )}
          </>
        )}
        <Text
          fixed
          style={{ position: "absolute", opacity: 0, fontSize: 1 }}
          render={({ totalPages }) => {
            if (Number.isInteger(totalPages) && totalPages > 0)
              onPageCount?.(totalPages);
            return "";
          }}
        />
      </Page>
    </Document>
  );
}
