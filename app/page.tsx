import Image from "next/image";
import { projects, socials } from "./schema";

export default function HomePage() {
  return (
    <>
      <header className="wrap site-header">
        <a className="wordmark" href="/">
          Rahil Khan
        </a>
        <nav className="nav" aria-label="Page">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="wrap">
        <section className="hero" aria-label="Introduction">
          <Image
            src="/rahil-khan.jpg"
            alt="Portrait of Rahil Khan"
            width={400}
            height={400}
            className="avatar"
            priority
          />
          <h1>Rahil Khan</h1>
          <p className="lede">
            Self-taught full-stack &amp; AI product developer, solo founder,
            Delhi, India
          </p>
        </section>

        <section id="about" className="about">
          <p className="section-label">About</p>
          <p>
            I&apos;m a self-taught full-stack and AI product developer, and a
            solo founder based in Delhi, India. I design, build, and ship my
            own products — from the first line of code to a live site.
          </p>
          <p>
            The work below is mine. I don&apos;t pad this page with years,
            certifications, clients, or stats I can&apos;t stand behind.
          </p>
        </section>

        <section id="projects">
          <p className="section-label">Projects</p>
          <div className="projects">
            {projects.map((project) => (
              <a
                key={project.name}
                className="project"
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="project-name">{project.name}</span>
                <span className="project-desc">{project.description}</span>
                <span className="project-go" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>

        <section id="contact">
          <p className="section-label">Socials &amp; contact</p>
          <ul className="socials">
            {socials.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
          <p className="email">
            Email{" "}
            <a href="mailto:rxhilkhan@gmail.com">rxhilkhan@gmail.com</a>
          </p>
        </section>
      </main>

      <footer className="wrap site-footer">
        <p>© {new Date().getFullYear()} Rahil Khan, Delhi, India</p>
      </footer>
    </>
  );
}
