import type { PolicyBlock, PolicyDoc } from '@/types/policy';

interface PolicyDocumentProps {
  doc: PolicyDoc;
}

export function PolicyDocument({ doc }: PolicyDocumentProps) {
  return (
    <div className="text-body-sm text-fg flex flex-col gap-8">
      {doc.intro && <Blocks blocks={doc.intro} />}
      {doc.sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <h2 className="text-section-title">{section.title}</h2>
          <Blocks blocks={section.blocks} />
        </section>
      ))}
    </div>
  );
}

function Blocks({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: PolicyBlock }) {
  if (typeof block === 'string') return <p>{block}</p>;

  if ('sub' in block) {
    return <h3 className="text-body-sm-strong mt-1">{block.sub}</h3>;
  }

  if ('list' in block) {
    const List = block.ordered ? 'ol' : 'ul';
    return (
      <List
        className={
          block.ordered
            ? 'flex list-decimal flex-col gap-2 pl-5'
            : 'flex list-disc flex-col gap-2 pl-5'
        }
      >
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    );
  }

  const [head, ...rows] = block.table;
  return (
    <div className="overflow-x-auto">
      <table className="border-border w-full border-collapse border text-left">
        <thead>
          <tr className="bg-surface-muted">
            {head.map((cell) => (
              <th key={cell} className="border-border border px-3 py-2">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={index} className="border-border border px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
