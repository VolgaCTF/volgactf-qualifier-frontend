export default {
  errorClass: 'is-invalid',
  successClass: 'is-valid',
  classHandler: function (ParsleyField) {
    return ParsleyField.$element.parents('.form-group')
  },
  errorsContainer: function (ParsleyField) {
    return ParsleyField.$element.parents('.form-group')
  },
  errorsWrapper: '<div class="invalid-feedback">',
  errorTemplate: '<span></span>'
}
