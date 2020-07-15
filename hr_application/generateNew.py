from io import StringIO, BytesIO
from docx.shared import Cm
from docxtpl import DocxTemplate, InlineImage

def from_template(template, docx_json):
    target_file = BytesIO()
    template = DocxTemplate(template)
    context = docx_json  # gets the context used to render the document
    # img_size = Cm(3)  # sets the size of the image
    # sign = InlineImage(template, signature, img_size)
    # context['signature'] = sign  # adds the InlineImage object to the context
    target_file = BytesIO()
    template.render(context)
    template.save(target_file)

    return target_file
