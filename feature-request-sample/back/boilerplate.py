head_after_begin_meta_charset_boilerplate = """
    <meta charset=utf-8 />
  """

head_after_begin_meta_viewport_boilerplate = """
    <meta name=viewport content="width=device-width, initial-scale=1" />
  """

head_before_end_styles_boilerplate = [
    """<link rel=stylesheet href=/component-test-colors.css />""",
    """<link rel=stylesheet href=/component-basic-compatible.css />""",
    """<link rel=stylesheet href=/component-modern-upgrade.css />""",
    """<link rel=stylesheet href=/component-basic-layout.css />"""
  ]

body_after_end_scripts_boilerplate = """
  <script src=/resize_embedder.js></script>
"""

boilerplate = {
  'head' : {
    'after_begin' : [
      head_after_begin_meta_charset_boilerplate,
      head_after_begin_meta_viewport_boilerplate,
    ],
    'before_end' : [
      head_before_end_styles_boilerplate
    ]
  },
  'body' : {
    'after_end' : [
      body_after_end_scripts_boilerplate
    ]
  }
}

