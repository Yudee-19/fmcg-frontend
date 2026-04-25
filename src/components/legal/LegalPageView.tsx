import type {
    LegalBlock,
    LegalContent,
    LegalSection,
    LegalSubsection,
} from "@/content/legal/types";

interface LegalPageViewProps {
    content: LegalContent;
}

function Block({ block }: { block: LegalBlock }) {
    if (block.type === "paragraph") {
        return (
            <p className="text-text-secondary leading-relaxed">{block.text}</p>
        );
    }
    if (block.type === "list") {
        return (
            <ul className="list-disc ps-6 space-y-1.5 text-text-secondary leading-relaxed marker:text-primary">
                {block.items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        );
    }
    return (
        <div className="border-s-4 border-primary bg-primary-light/60 ps-4 py-3 rounded-e-md text-text-primary font-medium">
            {block.text}
        </div>
    );
}

function Subsection({ sub }: { sub: LegalSubsection }) {
    return (
        <div className="space-y-3">
            <h3 className="text-base font-semibold text-text-primary">
                {sub.number ? `${sub.number} ` : ""}
                {sub.title}
            </h3>
            <div className="space-y-3">
                {sub.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                ))}
            </div>
        </div>
    );
}

function Section({ section }: { section: LegalSection }) {
    return (
        <section className="space-y-4 scroll-mt-24" id={section.number}>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                {section.number ? `${section.number}. ` : ""}
                {section.title}
            </h2>
            {section.blocks && section.blocks.length > 0 && (
                <div className="space-y-3">
                    {section.blocks.map((block, i) => (
                        <Block key={i} block={block} />
                    ))}
                </div>
            )}
            {section.subsections && section.subsections.length > 0 && (
                <div className="space-y-6 ps-2 sm:ps-4 border-s-2 border-border">
                    {section.subsections.map((sub, i) => (
                        <Subsection key={i} sub={sub} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default function LegalPageView({ content }: LegalPageViewProps) {
    return (
        <article className="bg-bg-card rounded-xl border border-border p-6 sm:p-10 space-y-8">
            <header className="space-y-2 border-b border-border pb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                    {content.title}
                </h1>
                {content.subtitle && (
                    <p className="text-base font-medium text-text-primary">
                        {content.subtitle}
                    </p>
                )}
                {content.tagline && (
                    <p className="text-sm text-text-secondary italic">
                        {content.tagline}
                    </p>
                )}
            </header>

            {content.intro && content.intro.length > 0 && (
                <div className="space-y-3">
                    {content.intro.map((p, i) => (
                        <p
                            key={i}
                            className="text-text-secondary leading-relaxed"
                        >
                            {p}
                        </p>
                    ))}
                </div>
            )}

            <div className="space-y-10">
                {content.sections.map((section, i) => (
                    <Section key={i} section={section} />
                ))}
            </div>
        </article>
    );
}
