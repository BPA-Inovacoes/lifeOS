import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { defaultContentForType } from "@/blocks/defaultContent";
import { getBlockComponent } from "@/blocks";
import type { BlockSlashProps } from "@/blocks/types";
import { DataPanel } from "@/components/DataPanel";
import { detectSlashTrigger, textBeforeSlash } from "@/editor/detectSlash";
import { SlashMenu } from "@/editor/SlashMenu";
import {
  filterSlashCommands,
  type SlashCommand,
} from "@/editor/slashCommands";
import { cn } from "@/lib/utils";
import type { BlockContent, BlockDto, BlockType } from "@/types/block";
import {
  createBlock,
  deleteBlock,
  reorderBlocks,
  updateBlock,
} from "@/services/workspaceApi";

type PageEditorProps = {
  workspaceId: string;
  pageId: string;
  blocks: BlockDto[];
  queryKey: readonly unknown[];
};

const TEXT_LIKE: BlockType[] = [
  "PARAGRAPH",
  "HEADING_1",
  "HEADING_2",
  "HEADING_3",
  "QUOTE",
  "CALLOUT",
  "TODO",
];

function supportsInlineSlash(type: BlockType) {
  return TEXT_LIKE.includes(type);
}

function contentWithText(block: BlockDto, text: string): BlockContent {
  return { ...block.content, text };
}

export function PageEditor({
  workspaceId,
  pageId,
  blocks: initialBlocks,
  queryKey,
}: PageEditorProps) {
  const qc = useQueryClient();
  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    initialBlocks.map((b) => b.id)
  );
  const [slashBlockId, setSlashBlockId] = useState<string | null>(null);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [inserter, setInserter] = useState("");
  const dragId = useRef<string | null>(null);
  const inserterRef = useRef<HTMLInputElement>(null);
  const slashTriggerRef = useRef<{ slashIndex: number } | null>(null);

  const blockMap = useMemo(() => {
    const m = new Map<string, BlockDto>();
    for (const b of initialBlocks) m.set(b.id, b);
    return m;
  }, [initialBlocks]);

  const blocks = orderedIds
    .map((id) => blockMap.get(id))
    .filter((b): b is BlockDto => Boolean(b));

  const filteredSlash = filterSlashCommands(slashQuery);

  useEffect(() => {
    setOrderedIds(initialBlocks.map((b) => b.id));
  }, [initialBlocks]);

  const patchBlock = useMutation({
    mutationFn: ({
      blockId,
      content,
      type,
    }: {
      blockId: string;
      content?: BlockContent;
      type?: BlockType;
    }) =>
      updateBlock(blockId, {
        ...(content !== undefined ? { content } : {}),
        ...(type !== undefined ? { type } : {}),
      }),
    onSuccess: (data) => {
      qc.setQueryData<{ page: { blocks: BlockDto[] } }>(queryKey, (old) =>
        old
          ? {
              page: {
                ...old.page,
                blocks: old.page.blocks.map((b) =>
                  b.id === data.block.id ? data.block : b
                ),
              },
            }
          : old
      );
    },
  });

  const closeSlash = useCallback(() => {
    setSlashBlockId(null);
    setSlashQuery("");
    setSlashIndex(0);
    slashTriggerRef.current = null;
  }, []);

  const addBlockAtEnd = useMutation({
    mutationFn: (type: BlockType) =>
      createBlock(workspaceId, pageId, {
        type,
        content: defaultContentForType(type),
      }),
    onSuccess: (data) => {
      qc.setQueryData<{ page: { blocks: BlockDto[] } }>(queryKey, (old) =>
        old
          ? { page: { ...old.page, blocks: [...old.page.blocks, data.block] } }
          : old
      );
      setOrderedIds((ids) => [...ids, data.block.id]);
      setInserter("");
      closeSlash();
    },
  });

  const insertBlockAfter = useMutation({
    mutationFn: async ({
      afterId,
      type,
      content,
    }: {
      afterId: string;
      type: BlockType;
      content?: BlockContent;
    }) => {
      const res = await createBlock(workspaceId, pageId, {
        type,
        content: content ?? defaultContentForType(type),
      });
      const ids = [...orderedIds];
      const idx = ids.indexOf(afterId);
      if (idx >= 0) {
        ids.splice(idx + 1, 0, res.block.id);
      } else {
        ids.push(res.block.id);
      }
      const reordered = await reorderBlocks(workspaceId, pageId, ids);
      return { block: res.block, ids, blocks: reordered.blocks };
    },
    onSuccess: (data) => {
      qc.setQueryData<{ page: { blocks: BlockDto[] } }>(queryKey, (old) =>
        old ? { page: { ...old.page, blocks: data.blocks } } : old
      );
      setOrderedIds(data.ids);
      closeSlash();
    },
  });

  const removeBlock = useMutation({
    mutationFn: (blockId: string) => deleteBlock(blockId),
    onSuccess: (_, blockId) => {
      qc.setQueryData<{ page: { blocks: BlockDto[] } }>(queryKey, (old) =>
        old
          ? {
              page: {
                ...old.page,
                blocks: old.page.blocks.filter((b) => b.id !== blockId),
              },
            }
          : old
      );
      setOrderedIds((ids) => ids.filter((id) => id !== blockId));
      if (slashBlockId === blockId) closeSlash();
    },
  });

  const reorder = useMutation({
    mutationFn: (blockIds: string[]) =>
      reorderBlocks(workspaceId, pageId, blockIds),
    onSuccess: (data) => {
      qc.setQueryData<{ page: { blocks: BlockDto[] } }>(queryKey, (old) =>
        old ? { page: { ...old.page, blocks: data.blocks } } : old
      );
      setOrderedIds(data.blocks.map((b) => b.id));
    },
  });

  const applySlashCommand = useCallback(
    (block: BlockDto, fullText: string, cmd: SlashCommand) => {
      const trigger = slashTriggerRef.current;
      if (!trigger) return;

      const before = textBeforeSlash(fullText, trigger.slashIndex);
      const onlySlash =
        fullText.trim().startsWith("/") &&
        before === "" &&
        fullText.slice(trigger.slashIndex).match(/^\/[^\s]*$/);

      if (onlySlash || before === "") {
        const content = defaultContentForType(cmd.type);
        if ("text" in content && cmd.type !== "DIVIDER") {
          (content as { text: string }).text = "";
        }
        patchBlock.mutate({
          blockId: block.id,
          type: cmd.type,
          content,
        });
        closeSlash();
        return;
      }

      patchBlock.mutate({
        blockId: block.id,
        content: contentWithText(block, before),
      });

      const newContent = defaultContentForType(cmd.type);
      insertBlockAfter.mutate({
        afterId: block.id,
        type: cmd.type,
        content: newContent,
      });
    },
    [closeSlash, insertBlockAfter, patchBlock]
  );

  const handleSlashSelect = (cmd: SlashCommand) => {
    if (slashBlockId) {
      const block = blockMap.get(slashBlockId);
      const el = document.querySelector(
        `[data-block-id="${slashBlockId}"] [contenteditable]`
      );
      const text = el?.textContent ?? "";
      if (block) applySlashCommand(block, text, cmd);
      return;
    }
    addBlockAtEnd.mutate(cmd.type);
  };

  const onInserterChange = (value: string) => {
    setInserter(value);
    setSlashBlockId(null);
    if (value.startsWith("/")) {
      setSlashQuery(value.slice(1));
      setSlashIndex(0);
    } else {
      setSlashQuery("");
    }
  };

  const onInserterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const slashOpen = inserter.startsWith("/");
    if (!slashOpen) {
      if (e.key === "Enter" && inserter.trim() === "") {
        addBlockAtEnd.mutate("PARAGRAPH");
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSlashIndex((i) => Math.min(i + 1, filteredSlash.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSlashIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filteredSlash[slashIndex];
      if (cmd) handleSlashSelect(cmd);
    } else if (e.key === "Escape") {
      setInserter("");
      setSlashQuery("");
    }
  };

  const makeSlashProps = (block: BlockDto): BlockSlashProps | undefined => {
    if (!supportsInlineSlash(block.type)) return undefined;

    return {
      onSlashInput: (text) => {
        const detected = detectSlashTrigger(text);
        if (detected) {
          setSlashBlockId(block.id);
          setSlashQuery(detected.query);
          setSlashIndex(0);
          slashTriggerRef.current = { slashIndex: detected.slashIndex };
          setInserter("");
        } else if (slashBlockId === block.id) {
          closeSlash();
        }
      },
      onSlashKeyDown: (e) => {
        if (slashBlockId !== block.id) return;
        const detected = slashTriggerRef.current;
        if (!detected) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSlashIndex((i) => Math.min(i + 1, filteredSlash.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSlashIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          const cmd = filteredSlash[slashIndex];
          if (cmd) {
            const el = e.currentTarget as HTMLElement;
            applySlashCommand(block, el.textContent ?? "", cmd);
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeSlash();
        }
      },
    };
  };

  const slashMenuOpen =
    (slashBlockId !== null || inserter.startsWith("/")) &&
    filteredSlash.length >= 0;

  const handleDragStart = (id: string) => {
    dragId.current = id;
  };

  const handleDrop = (targetId: string) => {
    const from = dragId.current;
    dragId.current = null;
    if (!from || from === targetId) return;

    const ids = [...orderedIds];
    const fromIdx = ids.indexOf(from);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, from);
    setOrderedIds(ids);
    reorder.mutate(ids);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <DataPanel
        header={
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/80">
            // conteúdo
          </span>
        }
        footer={
          <span className="font-mono text-xs uppercase text-muted-foreground">
            / em qualquer bloco ou abaixo · Enter linha vazia = parágrafo
          </span>
        }
      >
        <div className="space-y-0.5 p-3 md:p-4">
          {blocks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Página vazia. Escreve{" "}
              <kbd className="border border-border px-1 font-mono text-xs">/</kbd>{" "}
              abaixo para adicionar blocos.
            </p>
          ) : (
            blocks.map((block) => {
              const Component = getBlockComponent(block.type);
              const slashProps = makeSlashProps(block);
              const showMenu = slashBlockId === block.id && slashMenuOpen;

              return (
                <div
                  key={block.id}
                  data-block-id={block.id}
                  draggable
                  onDragStart={() => handleDragStart(block.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(block.id)}
                  className="group relative flex gap-2 border border-transparent px-1 py-1 transition-colors hover:border-border hover:bg-secondary/50"
                >
                  <button
                    type="button"
                    className="mt-1.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-60 active:cursor-grabbing"
                    aria-label="Arrastar bloco"
                    tabIndex={-1}
                  >
                    <GripVertical className="size-4 text-muted-foreground" />
                  </button>
                  <div className="relative min-w-0 flex-1">
                    {showMenu ? (
                      <div className="absolute left-0 top-full z-20 mt-1">
                        <SlashMenu
                          commands={filteredSlash}
                          activeIndex={slashIndex}
                          onSelect={handleSlashSelect}
                        />
                      </div>
                    ) : null}
                    <Component
                      block={block}
                      editable
                      slash={slashProps}
                      onChange={(content) =>
                        patchBlock.mutate({ blockId: block.id, content })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="mt-1.5 opacity-0 transition-opacity group-hover:opacity-60"
                    aria-label="Apagar bloco"
                    onClick={() => removeBlock.mutate(block.id)}
                  >
                    <Trash2 className="size-4 text-muted-foreground hover:text-red-400" />
                  </button>
                </div>
              );
            })
          )}

          <div className="relative border-t border-border/80 pt-3">
            {inserter.startsWith("/") && !slashBlockId ? (
              <div className="absolute bottom-full left-0 z-20 mb-1">
                <SlashMenu
                  commands={filteredSlash}
                  activeIndex={slashIndex}
                  onSelect={handleSlashSelect}
                />
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Plus className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inserterRef}
                value={inserter}
                onChange={(e) => onInserterChange(e.target.value)}
                onKeyDown={onInserterKeyDown}
                placeholder="Escreve '/' para comandos…"
                className={cn(
                  "w-full bg-transparent py-2 text-[15px] outline-none",
                  "placeholder:font-mono placeholder:text-xs placeholder:text-muted-foreground"
                )}
              />
            </div>
          </div>
        </div>
      </DataPanel>
    </div>
  );
}
