import { logger } from '$lib/logger';
import { Opfs, OpfsSchema } from '$lib/opfs';
import type { Action } from 'svelte/action';

type HTMLElementWithRef = HTMLElement & ({ src: string | undefined } | { href: string | undefined });

const log = logger.getSubLogger({ prefix: ['OPFS source loader:'] });
const BLOB_STRATEGY_THRESHOLD = 65_536; // 64KiB

export const opfsSrc: Action<HTMLElementWithRef, string | undefined> = function (
  node: HTMLElementWithRef,
  src: string | undefined,
) {
  function getRef() {
    if ('src' in node) return node.src;
    if ('href' in node) return node.href;
  }
  function setRef(value: string) {
    if ('src' in node) node.src = value;
    else if ('href' in node) node.href = value;
  }
  async function updateSrc(s: string | undefined) {
    const src = getRef();
    if (src?.startsWith('blob:')) {
      URL.revokeObjectURL(src);
    }

    if (!s) {
      setRef('');
      return;
    }

    if (s.startsWith(`${OpfsSchema}://`)) {
      if (!(await Opfs.isAvailable())) {
        log.error('OPFS is not available, cannot load file:', s);
        setRef('');
        return;
      }
      try {
        const file = await Opfs.get(s);
        if (file.size > BLOB_STRATEGY_THRESHOLD) {
          // If file is too big, use blob URL
          setRef(URL.createObjectURL(file));
        } else {
          // Otherwise, load it as data URL
          const reader = new FileReader();
          reader.onload = () => {
            setRef(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      } catch (e) {
        log.error('Error loading file from OPFS:', e);
        setRef('');
      }
    } else {
      setRef(s);
    }
  }

  updateSrc(src);

  return {
    destroy() {
      updateSrc('');
    },
    update(newSrc: string | undefined) {
      updateSrc(newSrc);
    },
  };
};
