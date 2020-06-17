# XML Document and Article Format

- XML format artical that supports
  - Create a `articleView.ts`
  - XML will be load during `router.register` as a embedded resource in config
  - `articleView.ts` will find the resource with a specific name and render to html
  - `https://www.npmjs.com/package/xml-js`

## XML Article Layout

```xml
<article index="true" numberBeforeTitle="true">
    <topic anchor="Name to use in 'a' element">
        <title>This is automatically a H1 title</title>
        <p>H1 title is the title of the article, numberBeforeTitle does not apply.</p>
        <p>paragraph</p>
        <p>Valid elements inside topic is, a single title, multiple pargraphcs and multiple topics</p>
        <topic>
            <title>H2</title>
            <p>numberBeforeTitle applies here and gives 1.xxx</p>
            <topic>
                <title>H3</title>
                <p>Becomes 1.1 H3</p>
            </topic>
            <topic>
                <title>H3</title>
                <p>Becomes 1.2 H3</p>
            </topic>
        </topic>
        <topic>
            <title>Regardless where a title is placed, it is always moved to the first</title>
            <p>numberBeforeTitle applies here and gives 2.xxx</p>
        </topic>
    </topic>
</article>
```

## XML Article Styles

```xml
<a href="./document.html">Text</a>
<symbol docId="SYMBOL-ID" declFile="optional: HTML source file" declId="optional: id in HTML source file"/>
<name>Just like `` in md</name>
<img src="logo.png"/>Description</img>
<ul><li>...</li></ul>
<ol><li>...</li></ol>
<b>translate to strong</b>
<em>translate to em</em>
<program project="vlpp" language="C++">
    <code>
        <![CDATA[translated to <pre><code>]]>
    </code>
    <output>
        <!--This will be automatically validated-->
        <![CDATA[translated to <pre><samp>]]>
    </output>
</program>
```

## XML Document

```xml
<summary>
  summary of the declaration
  <see cref="A::B`2"/> <!-- a link to another declaration -->
</summary>
<remarks>extra information that is related to this declaration</remakrs>
<example><![CDATA[code]]></example>
<seealso cref="A::B`2"/> <!-- a link to added to the "See Also" list -->
```

### Template Header

```xml
<typeparam name="NAME">summary of the type argument called NAME</typeparam>
```

### Function

```xml
<returns>summary of the function return value</returns/>
<param name="NAME">summary of the function parameter called NAME</param>
```

### Enum

```xml
<enumitem name="NAME">summary of the enum item called NAME</enumitem>
```

## XML Document (processed)

```xml
<Document
  symbolId="docId in hyper link"]
  accessor="public|protected|private"
  category="Enum|Class|Struct|Union|TypeAlias|Variable|ValueAlias|Namespace|Function"
  name="display name (decorated for functions and partial specialized declarations)"
  >
  <signature>
    <![CDATA[ code printed in the first topic ]]>
  </signature>
  <summary>...</summary>
  <remakrs>...</remarks>
  <example><![CDATA[code]]></example>
  <seealsos>
    <symbol/>
  </seealsos>
</Document>
```

### Template Header (processed)

```xml
<typeparam name="NAME">...</typeparam>
```

### Function (processed)

```xml
<returns>...</returns/>
<param name="NAME">...</param>
```

### Enum (processed)

```xml
<enumitem name="NAME">...</enumitem>
```

### Class (processed)

```xml
<basetypes>
  <symbol/>
</basetypes>
```

## XMl Document to Article Conversion

- `<signature>` is converted to `<program language="C++">`
- `<example>` is converted to `<program project="Auto-Inferred" language="C++ by default">`
  - `<output>` are automatically calculated for non-GacUI projects
- generate topics in order if available:
  - Signature
  - Summary
  - Type Arguments
  - Function Arguments
  - Return Value
  - Enum Items
  - Remakrs
  - Base Types
  - See Also
- Wherever text is available, it could also be multiple `<p>...</p>`.
  - Text and paragraph cannot be mixed. If there are paragraphs, then all paragraphs could and should be direct children.

## TODO

- Valid inside `<p/>`
  - Implement `symbol` after document is ready
  - Implement `program`'s after document is ready
    - For now only convert to HTML but no colorize and validate

- `litHtmlViewCallback` is not strongly typed
  - Make it strongly typed
  - Allow calculating some embedded resources from mvcModel's value
