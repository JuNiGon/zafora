import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ImagePlus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categories, productTags, sizeOptions } from "@/data/config";
import { formatPrice, parsePrice, slugify } from "@/data/products";
import {
  galleryChars,
  MAX_GALLERY_CHARS,
  MAX_IMAGES,
  newProductId,
  saveProduct,
  validateImageFile,
} from "@/services/products";
import { compressGalleryImage } from "@/lib/image-compress";
import type { Product, ProductInput } from "@/types/store";

/** Foto já comprimida (data URL). `isNew` indica que ainda não foi salva. */
type ImageEntry = { key: string; url: string; isNew: boolean };

const newKey = () => Math.random().toString(36).slice(2);

type Errors = Partial<Record<"name" | "slug" | "price" | "category" | "description" | "images", string>>;

type ProductFormProps = {
  /** Produto em edição. Ausente ao cadastrar um novo. */
  product?: Product;
  /** Fotos atuais da galeria (somente na edição). */
  initialImages?: string[];
  /** Slugs já usados por outros produtos (para evitar URLs duplicadas). */
  takenSlugs: string[];
};

export function ProductForm({ product, initialImages = [], takenSlugs }: ProductFormProps) {
  const navigate = useNavigate();
  const editing = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(editing);
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price).replace(".", ",") : "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [customSize, setCustomSize] = useState("");
  const [colors, setColors] = useState(product?.colors.join(", ") ?? "");
  const [tag, setTag] = useState(product?.tag ?? "");
  const [visible, setVisible] = useState(product?.visible ?? true);
  const [composition, setComposition] = useState(product?.composition ?? "");
  const [care, setCare] = useState(product?.care ?? "");
  const [images, setImages] = useState<ImageEntry[]>(() =>
    initialImages.map((url) => ({ key: newKey(), url, isNew: false })),
  );
  const [processing, setProcessing] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const categoryOptions = [...new Set([...categories, ...(product?.category ? [product.category] : [])])];
  const allSizes = [...new Set([...sizeOptions, ...sizes])];

  function handleName(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function toggleSize(size: string) {
    setSizes((current) =>
      current.includes(size)
        ? current.filter((s) => s !== size)
        : allSizes.filter((s) => s === size || current.includes(s)),
    );
  }

  function addCustomSize() {
    const value = customSize.trim().toUpperCase();
    if (value && !sizes.includes(value)) setSizes((current) => [...current, value]);
    setCustomSize("");
  }

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const room = Math.max(MAX_IMAGES - images.length - processing, 0);
    if (list.length > room) toast.error(`Máximo de ${MAX_IMAGES} imagens por produto.`);
    const selected = list.slice(0, room);
    setErrors((e) => ({ ...e, images: undefined }));

    for (const file of selected) {
      const problem = validateImageFile(file);
      if (problem) {
        toast.error(`${file.name}: ${problem}`);
        continue;
      }
      setProcessing((n) => n + 1);
      try {
        // Reduz e comprime a foto no navegador antes de guardar no Firestore.
        const url = await compressGalleryImage(file);
        setImages((current) => [...current, { key: newKey(), url, isNew: true }]);
      } catch {
        toast.error(`${file.name}: não foi possível processar a imagem.`);
      } finally {
        setProcessing((n) => n - 1);
      }
    }
  }

  function removeImage(key: string) {
    setImages((current) => current.filter((e) => e.key !== key));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (item) next.splice(target, 0, item);
      return next;
    });
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) void addFiles(event.dataTransfer.files);
  }

  function validate(): { input: ProductInput } | null {
    const next: Errors = {};
    const parsedPrice = parsePrice(price);
    const finalSlug = slugify(slug || name);
    if (name.trim().length < 2) next.name = "Informe o nome do produto.";
    if (!finalSlug) next.slug = "Informe um endereço válido.";
    else if (takenSlugs.includes(finalSlug)) next.slug = "Já existe outro produto com este endereço.";
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) next.price = "Informe um preço válido. Ex.: 129,90";
    if (!category) next.category = "Escolha uma categoria.";
    if (description.trim().length < 10) next.description = "Escreva uma descrição (mínimo de 10 caracteres).";
    if (!images.length) next.images = "Adicione pelo menos uma imagem.";
    else if (galleryChars(images.map((e) => e.url)) > MAX_GALLERY_CHARS)
      next.images = "As imagens ultrapassam o limite do produto. Remova uma delas.";
    setErrors(next);
    if (Object.keys(next).length) return null;

    return {
      input: {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        price: parsedPrice,
        category,
        sizes,
        colors: colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        tag,
        visible,
        composition: composition.trim(),
        care: care.trim(),
      },
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validate();
    if (!result) {
      toast.error("Revise os campos destacados.");
      return;
    }

    if (processing) {
      toast.error("Aguarde o processamento das imagens.");
      return;
    }

    setSaving(true);
    try {
      await saveProduct(
        product?.id ?? newProductId(),
        result.input,
        images.map((e) => e.url),
        !product,
      );
      toast.success(product ? "Produto atualizado." : "Produto cadastrado.");
      navigate({ to: "/admin" });
    } catch (error) {
      console.error(error);
      const code = (error as { code?: string }).code ?? "";
      const messages: Record<string, string> = {
        "permission-denied":
          "O Firestore negou a gravação. Publique as regras (firestore.rules) e confira o documento admins/{seu UID}.",
        "invalid-argument": "As imagens ficaram grandes demais para um produto. Remova uma delas e tente de novo.",
        "zafora/images-too-large": "As imagens ficaram grandes demais para um produto. Remova uma delas.",
        unavailable: "Sem conexão com o Firebase. Verifique sua internet.",
      };
      toast.error(messages[code] ?? `Não foi possível salvar o produto (${code || "erro desconhecido"}).`, {
        duration: 12000,
      });
      setSaving(false);
    }
  }

  const parsedPrice = parsePrice(price);

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="product-form-main">
        <section className="panel">
          <h2>Informações</h2>
          <div className="field">
            <Label htmlFor="pf-name">Nome do produto *</Label>
            <Input
              id="pf-name"
              value={name}
              onChange={(e) => handleName(e.target.value)}
              maxLength={120}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div className="field">
            <Label htmlFor="pf-slug">Endereço da página</Label>
            <div className="slug-input">
              <span>/produto/</span>
              <Input
                id="pf-slug"
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(e.target.value);
                }}
                onBlur={() => setSlug(slugify(slug || name))}
                aria-invalid={!!errors.slug}
              />
            </div>
            {errors.slug && <p className="field-error">{errors.slug}</p>}
          </div>
          <div className="field">
            <Label htmlFor="pf-description">Descrição *</Label>
            <Textarea
              id="pf-description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>
          <div className="field-row">
            <div className="field">
              <Label htmlFor="pf-price">Preço base (R$) *</Label>
              <Input
                id="pf-price"
                inputMode="decimal"
                placeholder="129,90"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={!!errors.price}
              />
              {errors.price ? (
                <p className="field-error">{errors.price}</p>
              ) : (
                Number.isFinite(parsedPrice) && <p className="field-hint">{formatPrice(parsedPrice)}</p>
              )}
            </div>
            <div className="field">
              <Label htmlFor="pf-category">Categoria *</Label>
              <select
                id="pf-category"
                className="native-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-invalid={!!errors.category}
              >
                <option value="">Selecione…</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && <p className="field-error">{errors.category}</p>}
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Imagens *</h2>
          <div
            className={`dropzone ${dragging ? "is-dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <ImagePlus size={26} aria-hidden="true" />
            <p>Arraste as fotos aqui ou</p>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
              Escolher arquivos
            </Button>
            <p className="demo-note">
              JPG, PNG ou WebP · máximo de {MAX_IMAGES} imagens · as fotos são otimizadas automaticamente
            </p>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) void addFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
          </div>
          {errors.images && <p className="field-error">{errors.images}</p>}
          {processing > 0 && <p className="field-hint mt-3">Otimizando {processing} imagem(ns)…</p>}
          {images.length > 0 && (
            <ul className="image-grid">
              {images.map((entry, index) => (
                <li key={entry.key} className="image-tile">
                  <img src={entry.url} alt={`Imagem ${index + 1}`} />
                  {index === 0 && <span className="image-badge">Capa</span>}
                  {entry.isNew && <span className="image-badge image-badge-new">Nova</span>}
                  <div className="image-tools">
                    <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="Mover para a esquerda">
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label="Mover para a direita"
                    >
                      <ArrowRight size={14} />
                    </button>
                    <button type="button" onClick={() => removeImage(entry.key)} aria-label="Remover imagem">
                      <X size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Detalhes opcionais</h2>
          <div className="field">
            <Label htmlFor="pf-composition">Tecido e composição</Label>
            <Input id="pf-composition" value={composition} onChange={(e) => setComposition(e.target.value)} />
          </div>
          <div className="field">
            <Label htmlFor="pf-care">Cuidados com a peça</Label>
            <Input id="pf-care" value={care} onChange={(e) => setCare(e.target.value)} />
          </div>
        </section>
      </div>

      <aside className="product-form-side">
        <section className="panel">
          <h2>Tamanhos disponíveis</h2>
          <div className="option-row">
            {allSizes.map((size) => (
              <Button
                key={size}
                type="button"
                size="sm"
                variant={sizes.includes(size) ? "selected" : "outline"}
                aria-pressed={sizes.includes(size)}
                onClick={() => toggleSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
          <div className="custom-size">
            <Input
              placeholder="Outro tamanho"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSize();
                }
              }}
              aria-label="Adicionar outro tamanho"
            />
            <Button type="button" variant="outline" size="icon" onClick={addCustomSize} aria-label="Adicionar tamanho">
              <Plus />
            </Button>
          </div>
          <p className="demo-note mt-2">Deixe sem tamanhos para acessórios de tamanho único.</p>
        </section>

        <section className="panel">
          <h2>Cores</h2>
          <Input
            placeholder="Ex.: Off-white, Preto, Vinho"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            aria-label="Cores disponíveis, separadas por vírgula"
          />
          <p className="demo-note mt-2">Separe por vírgula. Com mais de uma cor, o cliente escolhe na página.</p>
        </section>

        <section className="panel">
          <h2>Exibição</h2>
          <label className="admin-visibility mb-4">
            <Switch checked={visible} onCheckedChange={setVisible} />
            <span>{visible ? "Visível na loja" : "Oculto da loja"}</span>
          </label>
          <div className="field">
            <Label htmlFor="pf-tag">Selo</Label>
            <select id="pf-tag" className="native-select" value={tag} onChange={(e) => setTag(e.target.value)}>
              {productTags.map((t) => (
                <option key={t} value={t}>
                  {t || "Nenhum"}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="product-form-actions">
          <Button type="submit" size="lg" className="w-full" disabled={saving || processing > 0}>
            {saving ? "Salvando…" : editing ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
          <Button type="button" variant="ghost" className="w-full" disabled={saving} onClick={() => navigate({ to: "/admin" })}>
            Cancelar
          </Button>
        </div>
      </aside>
    </form>
  );
}
