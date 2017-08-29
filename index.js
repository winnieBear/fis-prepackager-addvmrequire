module.exports = function (ret, conf, settings, opt) {

  // 为什么要在代码中添加同名依赖，而不是在fis.conf添加同名依赖的配置? 因为我要保证依赖的顺序，fis.conf的同名依赖产出的依赖表对资源的依赖顺序没法保证依赖在前
  fis.util.map(ret.src, function (subpath, file) {
    if (file.ext !== '.vm') {
      if (file.isJsLike) {
        // js文件添加同名依赖
        file.addSameNameRequire('.css');
      }

      return;
    }

    var content = file.getContent();
    var reg = /(#\*[\s\S]*?(?:\*#|$)|##[^\n\r\f]*)|(?:#(html|require|extends|widget)\s*\(\s*('|")(.*?)\3)/ig;
    var callback = function (m, comment, directive, quote, url) {
      if (url) {
        //console.info('url',url  )
        var depid = url.trim();
        var pos = depid.indexOf(':');
        if (pos > -1) {
          var ns = depid.substring(0, pos);
          var thisNamespace = fis.config.get('namespace');
          if (ns !== thisNamespace) {
            return m;
          }
        }
        //console.info('file.id',file.id)
        if (depid !== file.id) {
          file.addRequire(depid);
        }
      }
      return m;
    };
    content.replace(reg, callback);

    // 添加vm文件的同名依赖
    // console.log('***%s',file.id)
    file.addSameNameRequire('.js');
    file.addSameNameRequire('.css');

    //update ret.map
    if (file.requires && file.requires.length) {
      ret.map.res[ file.id ].deps = file.requires;
    }
  });
};
